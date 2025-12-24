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
                _id: '5f50c31b9d1b2c0017c1c1c1',
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

        // Be tolerant: tweet may be an id string or an object with _id
        const first = response.body.comments[0];
        expect(first._id).toBe('5f50c31b9d1b2c0017c1c1c1');
        expect(first.text).toBe('First comment');
        if (typeof first.tweet === 'string') {
            expect(first.tweet).toBe('t1');
        } else if (first.tweet && first.tweet._id) {
            expect(first.tweet._id).toBe('t1');
        } else {
            // if tweet shape unexpected, fail to aid debugging
            throw new Error('Unexpected tweet shape in GET /comments response');
        }
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
        jest.spyOn(Comment, 'find')
            .mockImplementationOnce(() => ({ countDocuments: () => Promise.resolve(0) }))
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

    describe('GET /comments/:id', () => {
        test('GET /comments/:id returns 200 and the comment when found', async () => {
            // use the exact comment document provided by the user
            const commentId = '694bfd8933176dd45a638541';
            const mockComment = {
                _id: commentId,
                tweet: '694bfd7c33176dd45a63853c',
                text: 'comment 1',
                likes: [],
                creator: '680be1b42894596771cbe2f8',
                createdAt: '2025-12-24T14:49:45.740Z',
                updatedAt: '2025-12-24T14:49:45.740Z',
                __v: 0
            };

            jest.spyOn(Comment, 'findById').mockImplementationOnce(() => makePopulateMock(mockComment));

            const response = await request(app)
                .get(`/comments/${commentId}`)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/application\/json/);

            const returned = response.body.comment;
            // basic fields
            expect(returned._id).toBe(commentId);
            expect(returned.text).toBe('comment 1');

            // tweet may be an id string or populated object; assert the id matches the provided one
            if (typeof returned.tweet === 'string') {
                expect(returned.tweet).toBe('694bfd7c33176dd45a63853c');
            } else if (returned.tweet && returned.tweet._id) {
                expect(returned.tweet._id).toBe('694bfd7c33176dd45a63853c');
            } else {
                throw new Error('Unexpected tweet shape in GET /comments/:id response');
            }

            // creator may be an id string or populated object; assert the id matches the provided one
            if (typeof returned.creator === 'string') {
                expect(returned.creator).toBe('680be1b42894596771cbe2f8');
            } else if (returned.creator && returned.creator._id) {
                expect(returned.creator._id).toBe('680be1b42894596771cbe2f8');
            } else {
                throw new Error('Unexpected creator shape in GET /comments/:id response');
            }
        });

        test('GET /comments/:id returns 404 when comment not found', async () => {
            const commentId = 'missingId';
            jest.spyOn(Comment, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const response = await request(app)
                .get(`/comments/${commentId}`)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Comment not found'
                })
            );
        });

        test('GET /comments/:id returns 500 on DB error', async () => {
            const commentId = 'errId';
            jest.spyOn(Comment, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const response = await request(app)
                .get(`/comments/${commentId}`)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });
});
