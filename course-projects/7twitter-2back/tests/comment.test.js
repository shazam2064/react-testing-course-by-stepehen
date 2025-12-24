const request = require('supertest');
const app = require('./testUtils');
const Comment = require('../models/comment.model');
const { mongoConnect, closeConnection } = require('../util/database');

function makePopulateMock(result, shouldReject = false) {
    return {
        populate() {
            return this;
        },
        skip() {
            return this;
        },
        limit() {
            return this;
        },
        then(onFulfilled, onRejected) {
            if (shouldReject) {
                return Promise.reject(result).then(onFulfilled, onRejected);
            }
            return Promise.resolve(result).then(onFulfilled, onRejected);
        },
        catch(onRejected) {
            return this.then(undefined, onRejected);
        }
    };
}

describe('Comment Controller Tests', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await closeConnection();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('GET /comments returns 200 and a list of comments with total', async () => {
        const mockComments = [
            {
                _id: 'c1',
                text: 'First comment',
                tweet: { _id: 't1', text: 'Tweet 1' },
                creator: { _id: 'u1', name: 'User 1' },
                createdAt: '2025-01-01T00:00:00.000Z'
            },
            {
                _id: 'c2',
                text: 'Second comment',
                tweet: { _id: 't2', text: 'Tweet 2' },
                creator: { _id: 'u2', name: 'User 2' },
                createdAt: '2025-01-02T00:00:00.000Z'
            }
        ];

        jest.spyOn(Comment, 'find')
            .mockImplementationOnce(() => ({ countDocuments: () => Promise.resolve(2) }))
            .mockImplementationOnce(() => makePopulateMock(mockComments));

        const response = await request(app)
            .get('/comments')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Comments fetched successfully',
                comments: expect.any(Array),
                total: 2
            })
        );

        expect(response.body.comments.length).toBe(2);
        expect(response.body.comments[0]).toEqual(expect.objectContaining({
            _id: 'c1',
            text: 'First comment',
            tweet: expect.objectContaining({ _id: 't1' })
        }));
    });

    test('GET /comments returns 500 when countDocuments rejects', async () => {
        jest.spyOn(Comment, 'find').mockImplementationOnce(() => ({
            countDocuments: () => Promise.reject(new Error('Database error'))
        }));

        const response = await request(app)
            .get('/comments')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Database error'
            })
        );
    });

    test('GET /comments returns 500 when fetching comments (populate) rejects', async () => {
        // countDocuments resolves
        jest.spyOn(Comment, 'find')
            .mockImplementationOnce(() => ({ countDocuments: () => Promise.resolve(0) }))
            // fetching comments rejects
            .mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

        const response = await request(app)
            .get('/comments')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Database error'
            })
        );
    });
});

