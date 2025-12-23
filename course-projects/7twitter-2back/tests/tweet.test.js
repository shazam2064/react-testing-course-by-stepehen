const request = require('supertest');
const app = require('./testUtils');
const Tweet = require('../models/tweet.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
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
    beforeAll(async () => {
        await mongoConnect();

        // ensure a test user exists so we can obtain an auth token
        const passwordHash = await bcrypt.hash('123456', 12);
        await User.updateOne(
            { email: 'gabrielsalomon.990@gmail.com' },
            {
                $set: {
                    email: 'gabrielsalomon.990@gmail.com',
                    password: passwordHash,
                    name: 'User Test 1',
                    isAdmin: true,
                    image: 'images/default.png',
                }
            },
            { upsert: true }
        );
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

    describe('POST /tweets', () => {
        let validToken;
        let userDoc;

        beforeAll(async () => {
            // login to get a valid token
            const loginRes = await request(app)
                .post('/auth/login')
                .send({ email: 'gabrielsalomon.990@gmail.com', password: '123456' })
                .set('Content-Type', 'application/json');

            expect(loginRes.status).toBe(200);
            validToken = loginRes.body.token;

            userDoc = await User.findOne({ email: 'gabrielsalomon.990@gmail.com' }).lean();
        });

        test('creates a tweet and returns 201 with tweet and creator', async () => {
            // prepare a tweet instance data (the controller constructs new Tweet internally)
            const tweetText = 'tweet 1';

            // mock Tweet.prototype.save to resolve to the instance (this)
            jest.spyOn(Tweet.prototype, 'save').mockImplementationOnce(function () {
                // simulate mongodb assigning an _id on save
                this._id = this._id || 'mockTweetId1';
                return Promise.resolve(this);
            });

            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: userDoc._id,
                name: userDoc.name,
                tweets: [],
                save: jest.fn().mockResolvedValue(true)
            });

            const response = await request(app)
                .post('/tweets')
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', tweetText)
                .attach('image', Buffer.from('fakeimage'), 'image.jpg');

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet created successfully',
                    tweet: expect.objectContaining({
                        text: tweetText
                    }),
                    creator: expect.objectContaining({
                        name: expect.any(String)
                    })
                })
            );
        });

        test('creates a tweet without an image (no file attached)', async () => {
            const tweetText = 'tweet no image';

            // mock save to resolve to the instance
            jest.spyOn(Tweet.prototype, 'save').mockImplementationOnce(function () {
                this._id = this._id || 'mockTweetNoImage';
                return Promise.resolve(this);
            });

            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: userDoc._id,
                name: userDoc.name,
                tweets: [],
                save: jest.fn().mockResolvedValue(true)
            });

            const response = await request(app)
                .post('/tweets')
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', tweetText);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet created successfully',
                    tweet: expect.objectContaining({ text: tweetText }),
                    creator: expect.objectContaining({ name: expect.any(String) })
                })
            );
        });

        test('returns 500 when User.findById returns null (creator not found)', async () => {
            const tweetText = 'tweet creator missing';

            jest.spyOn(Tweet.prototype, 'save').mockImplementationOnce(function () {
                this._id = this._id || 'mockTweetMissingCreator';
                return Promise.resolve(this);
            });

            // user not found
            jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .post('/tweets')
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', tweetText);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
        });

        test('returns 500 when saving the user (user.save rejects)', async () => {
            const tweetText = 'tweet user save fail';

            jest.spyOn(Tweet.prototype, 'save').mockImplementationOnce(function () {
                this._id = this._id || 'mockTweetUserSaveFail';
                return Promise.resolve(this);
            });

            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: userDoc._id,
                name: userDoc.name,
                tweets: [],
                save: jest.fn().mockRejectedValueOnce(new Error('User save failed'))
            });

            const response = await request(app)
                .post('/tweets')
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', tweetText);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(expect.objectContaining({ message: 'User save failed' }));
        });

        test('returns 500 when Tweet.save fails', async () => {
            // ensure login token still available
            const tweetText = 'tweet 2';

            // mock save to reject
            jest.spyOn(Tweet.prototype, 'save').mockImplementationOnce(() => Promise.reject(new Error('Database error')));

            const response = await request(app)
                .post('/tweets')
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', tweetText);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('PUT /tweets/:id', () => {
        let validToken;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/auth/login')
                .send({ email: 'gabrielsalomon.990@gmail.com', password: '123456' })
                .set('Content-Type', 'application/json');

            expect(loginRes.status).toBe(200);
            validToken = loginRes.body.token;
        });

        test('updates a tweet and returns 200 with updated tweet', async () => {
            const tweetId = '5f50c31b9d1b2c0017a1a1a9';
            const existingTweet = {
                _id: tweetId,
                text: 'old text',
                image: null,
                save: jest.fn().mockImplementation(function () {
                    // simulate that save returns the updated tweet
                    return Promise.resolve(Object.assign(this));
                })
            };

            // findById should resolve to the tweet-like object
            jest.spyOn(Tweet, 'findById').mockResolvedValueOnce(existingTweet);

            const newText = 'updated text';

            const response = await request(app)
                .put(`/tweets/${tweetId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', newText);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet updated successfully',
                    tweet: expect.objectContaining({
                        // controller returns the saved result
                        text: newText
                    })
                })
            );
        });

        test('returns 404 when tweet not found', async () => {
            const tweetId = '000000000000000000000000';
            jest.spyOn(Tweet, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .put(`/tweets/${tweetId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', 'does not matter');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tweet not found'
                })
            );
        });

        test('returns 500 when saving the tweet fails', async () => {
            const tweetId = '5f50c31b9d1b2c0017a1a1b0';
            const faultyTweet = {
                _id: tweetId,
                text: 'old text',
                image: null,
                save: jest.fn().mockRejectedValueOnce(new Error('Save failed'))
            };

            jest.spyOn(Tweet, 'findById').mockResolvedValueOnce(faultyTweet);

            const response = await request(app)
                .put(`/tweets/${tweetId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .field('text', 'new text');

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Save failed'
                })
            );
        });
    });
});
