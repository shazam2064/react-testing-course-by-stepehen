const request = require('supertest');
const app = require('./testUtils');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

jest.setTimeout(20000);

function makePopulateMock(result, shouldReject = false) {
    const chain = {
        populate() { return chain; },
        skip() { return chain; },
        limit() { return chain; },
        sort() { return chain; },
        exec() {
            return shouldReject ? Promise.reject(result) : Promise.resolve(result);
        },
        then(onFulfilled, onRejected) {
            return this.exec().then(onFulfilled, onRejected);
        },
        catch(onRejected) {
            return this.exec().catch(onRejected);
        }
    };
    return chain;
}

describe('Comment Controller Tests', () => {
    beforeAll(async () => {
        const {mongoConnect} = require('../util/database');
        await mongoConnect();

        const {ObjectId} = require('mongodb');
        const adminObjectId = new ObjectId('6972784f82b1d18304306cb9');
        const passwordHash = await bcrypt.hash('123456', 12);

        await User.updateOne(
            {email: 'gabrielsalomon.980m@gmail.com'},
            {
                $set: {
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: passwordHash,
                    name: 'Gabriel Salomon',
                    isAdmin: true,
                    verificationToken: undefined,
                    verificationTokenExpiration: undefined,
                },
                $setOnInsert: {_id: adminObjectId}
            },
            {upsert: true}
        );

        // Ensure a post exists to attach comments to
        const postId = new ObjectId('697905bfa9f9f488d664e2f1');
        await Post.updateOne(
            {_id: postId},
            {
                $set: {
                    content: 'Post for comment tests',
                    creator: adminObjectId,
                    image: 'images/default.png'
                }
            },
            {upsert: true}
        );

        // create/upsert test comments tied to the post and admin user
        const comment1Id = new ObjectId('698905bfa9f9f488d664e3a1');
        const comment2Id = new ObjectId('698905bfa9f9f488d664e3a2');

        await Comment.updateOne(
            {_id: comment1Id},
            {
                $set: {
                    post: postId,
                    text: 'Integration test comment 1',
                    creator: adminObjectId
                }
            },
            {upsert: true}
        );

        await Comment.updateOne(
            {_id: comment2Id},
            {
                $set: {
                    post: postId,
                    text: 'Integration test comment 2',
                    creator: adminObjectId
                }
            },
            {upsert: true}
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('GET /comments (list)', () => {
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

        it('returns 200 and list of comments (contains integration comments)', async () => {
            const res = await request(app)
                .get('/comments')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Comments fetched successfully',
                comments: expect.any(Array)
            }));

            const texts = res.body.comments.map(c => c.text);
            expect(texts).toEqual(expect.arrayContaining(['Integration test comment 1', 'Integration test comment 2']));
        });

        it('returns 200 and mocked comments when Comment.find resolves', async () => {
            const mockedComments = [
                {_id: 'c1', text: 'mock comment 1', post: {_id: 'p1'}},
                {_id: 'c2', text: 'mock comment 2', post: {_id: 'p2'}}
            ];
            jest.spyOn(Comment, 'find').mockImplementationOnce(() => makePopulateMock(mockedComments));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/comments')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const texts = res.body.comments.map(c => c.text);
            expect(texts).toEqual(expect.arrayContaining(['mock comment 1', 'mock comment 2']));
        });

        it('returns 500 when Comment.find rejects', async () => {
            jest.spyOn(Comment, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/comments')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    describe('GET /comments/:commentId (single)', () => {
        let validToken;
        const existingCommentId = '698905bfa9f9f488d664e3a1';

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

        it('returns 200 and the comment details when found', async () => {
            const res = await request(app)
                .get(`/comments/${existingCommentId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Comment fetched successfully',
                comment: expect.objectContaining({
                    _id: existingCommentId,
                    text: expect.any(String),
                })
            }));
        });

        it('returns 404 when the comment is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Comment, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .get(`/comments/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({message: 'Comment not found'}));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Comment.findById rejects', async () => {
            const badId = '698905bfa9f9f488d664e3ff';
            jest.spyOn(Comment, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .get(`/comments/${badId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    afterAll(async () => {
        const {closeConnection} = require('../util/database');
        await closeConnection();
    });
});
