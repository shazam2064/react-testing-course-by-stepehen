const request = require('supertest');
const app = require('./testUtils');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

jest.setTimeout(20000);

function makePopulateMock(result, shouldReject = false) {
    return {
        populate() { return this; },
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

describe('Post Controller Tests', () => {
    beforeAll(async () => {
        const { mongoConnect } = require('../util/database');
        await mongoConnect();

        const { ObjectId } = require('mongodb');
        const adminObjectId = new ObjectId('6972784f82b1d18304306cb9');
        const passwordHash = await bcrypt.hash('123456', 12);

        await User.updateOne(
            { email: 'gabrielsalomon.980m@gmail.com' },
            {
                $set: {
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: passwordHash,
                    name: 'Gabriel Salomon',
                    isAdmin: true,
                    verificationToken: undefined,
                    verificationTokenExpiration: undefined,
                },
                $setOnInsert: { _id: adminObjectId }
            },
            { upsert: true }
        );

        // create/upsert test posts tied to admin user
        const post1Id = new ObjectId('697905bfa9f9f488d664e2f1');
        const post2Id = new ObjectId('697905bfa9f9f488d664e2f2');

        await Post.updateOne(
            { _id: post1Id },
            {
                $set: {
                    content: 'Integration test post 1',
                    creator: adminObjectId,
                    image: 'images/default.png'
                }
            },
            { upsert: true }
        );

        await Post.updateOne(
            { _id: post2Id },
            {
                $set: {
                    content: 'Integration test post 2',
                    creator: adminObjectId,
                    image: 'images/default.png'
                }
            },
            { upsert: true }
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('GET /posts (list)', () => {
        let validToken;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');

            expect(loginResponse.status).toBe(200);
            validToken = loginResponse.body.token;
        });

        it('returns 200 and list of posts (contains integration posts)', async () => {
            const res = await request(app)
                .get('/posts')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Posts fetched successfully',
                posts: expect.any(Array)
            }));

            const contents = res.body.posts.map(p => p.content);
            expect(contents).toEqual(expect.arrayContaining(['Integration test post 1', 'Integration test post 2']));
        });

        it('returns 200 and mocked posts when Post.find resolves', async () => {
            const mockedPosts = [
                { _id: 'p1', content: 'mock post 1', creator: { _id: 'u1', name: 'User1' } },
                { _id: 'p2', content: 'mock post 2', creator: { _id: 'u2', name: 'User2' } }
            ];
            jest.spyOn(Post, 'find').mockImplementationOnce(() => makePopulateMock(mockedPosts));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/posts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const contents = res.body.posts.map(p => p.content);
            expect(contents).toEqual(expect.arrayContaining(['mock post 1', 'mock post 2']));
        });

        it('returns 500 when Post.find rejects', async () => {
            jest.spyOn(Post, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/posts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    describe('GET /posts/:postId (single)', () => {
        let validToken;
        const existingPostId = '697905bfa9f9f488d664e2f1';

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');

            expect(loginResponse.status).toBe(200);
            validToken = loginResponse.body.token;
        });

        it('returns 200 and the post details when found', async () => {
            const res = await request(app)
                .get(`/posts/${existingPostId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Post fetched successfully',
                post: expect.objectContaining({
                    _id: existingPostId,
                    content: expect.any(String),
                })
            }));
        });

        it('returns 404 when the post is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Post, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .get(`/posts/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({ message: 'Post not found' }));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Post.findById rejects', async () => {
            const badId = '697905bfa9f9f488d664e2ff';
            jest.spyOn(Post, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .get(`/posts/${badId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    afterAll(async () => {
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});

