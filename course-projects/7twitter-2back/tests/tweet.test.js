const request = require('supertest');
const app = require('./testUtils');
const Tweet = require('../models/tweet.model');
const {mongoConnect, closeConnection} = require('../util/database');

function makePopulateMock(result, shouldReject = false) {
    return {
        populate() {
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

describe('Tweet Controller Tests', () => {
    // shared lifecycle for all tweet tests
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

    describe('GET /tweets', () => {
        test('returns 200 and a list of tweets (with populated creator and comments)', async () => {
            const mockTweet = {
                _id: '5f50c31b9d1b2c0017a1a1a1',
                text: 'Hello world',
                image: 'images/default.png',
                creator: {_id: '680be1b42894596771cbe2f8', name: 'User Test 1'},
                comments: [
                    {_id: 'a1', text: 'Nice', creator: {_id: 'u2', name: 'Commenter'}}
                ],
                likes: [],
                retweets: [],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                __v: 0
            };

            // Tweet.find() -> chainable populate -> resolves to array of tweets
            jest.spyOn(Tweet, 'find').mockImplementationOnce(() => makePopulateMock([mockTweet]));

            const response = await request(app)
                .get('/tweets')
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/application\/json/);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweets fetched successfully',
                    tweets: expect.any(Array)
                })
            );

            expect(response.body.tweets.length).toBeGreaterThanOrEqual(1);
            const t = response.body.tweets[0];
            expect(t).toEqual(expect.objectContaining({
                _id: mockTweet._id,
                text: mockTweet.text,
                creator: expect.objectContaining({name: 'User Test 1'}),
                comments: expect.any(Array)
            }));
        });

        test('returns 500 when Tweet.find rejects', async () => {
            jest.spyOn(Tweet, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const response = await request(app)
                .get('/tweets')
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('GET /tweets/:id', () => {
        test('GET /tweets/:id returns 200 and the tweet when found', async () => {
            const tweetId = '5f50c31b9d1b2c0017a1a1a1';
            const mockTweet = {
                _id: tweetId,
                text: 'Single tweet',
                image: 'images/default.png',
                creator: {_id: '680be1b42894596771cbe2f8', name: 'User Test 1'},
                comments: [
                    {_id: 'c1', text: 'Nice', creator: {_id: 'u2', name: 'Commenter'}}
                ],
                likes: [],
                retweets: [],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z',
                __v: 0
            };

            jest.spyOn(Tweet, 'findById').mockImplementationOnce(() => makePopulateMock(mockTweet));

            const response = await request(app)
                .get(`/tweets/${tweetId}`)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet fetched successfully',
                    tweet: expect.objectContaining({
                        _id: tweetId,
                        text: mockTweet.text,
                        creator: expect.objectContaining({name: 'User Test 1'}),
                    })
                })
            );
        });

        test('GET /tweets/:id returns 404 when tweet not found', async () => {
            const tweetId = '000000000000000000000000';
            jest.spyOn(Tweet, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const response = await request(app)
                .get(`/tweets/${tweetId}`)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet not found'
                })
            );
        });

        test('GET /tweets/:id returns 500 on DB error', async () => {
            const tweetId = '5f50c31b9d1b2c0017a1a1a2';
            jest.spyOn(Tweet, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const response = await request(app)
                .get(`/tweets/${tweetId}`)
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
