const request = require('supertest');
const app = require('./testUtils');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
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

describe('Conversation Controller Tests', () => {
    beforeAll(async () => {
        const {mongoConnect} = require('../util/database');
        await mongoConnect();

        const {ObjectId} = require('mongodb');
        const adminObjectId = new ObjectId('6972784f82b1d18304306cb9'); // same admin used elsewhere
        const otherUserId = new ObjectId('6979999f82b1d18304306aa1');
        const passwordHash = await bcrypt.hash('123456', 12);

        // upsert admin user
        await User.updateOne(
            {email: 'gabrielsalomon.980m@gmail.com'},
            {
                $set: {
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: passwordHash,
                    name: 'Gabriel Salomon',
                    isAdmin: true
                },
                $setOnInsert: {_id: adminObjectId}
            },
            {upsert: true}
        );

        // upsert a second user to be a conversation participant
        await User.updateOne(
            {_id: otherUserId},
            {
                $set: {
                    email: 'other.user@test.local',
                    password: 'irrelevant',
                    name: 'Other User'
                }
            },
            {upsert: true}
        );

        // create/upsert messages and conversations for integration tests
        const conv1Id = new ObjectId('697a0000a9f9f488d664a001');
        const conv2Id = new ObjectId('697a0000a9f9f488d664a002');
        const msg1Id = new ObjectId('697a0000a9f9f488d664b001');
        const msg2Id = new ObjectId('697a0000a9f9f488d664b002');

        await Message.updateOne(
            {_id: msg1Id},
            {
                $set: {
                    conversation: conv1Id,
                    sender: adminObjectId,
                    text: 'Integration conversation message 1'
                }
            },
            {upsert: true}
        );

        await Message.updateOne(
            {_id: msg2Id},
            {
                $set: {
                    conversation: conv2Id,
                    sender: adminObjectId,
                    text: 'Integration conversation message 2'
                }
            },
            {upsert: true}
        );

        await Conversation.updateOne(
            {_id: conv1Id},
            {
                $set: {
                    participants: [adminObjectId, otherUserId],
                    messages: [msg1Id],
                    lastMessage: msg1Id
                }
            },
            {upsert: true}
        );

        await Conversation.updateOne(
            {_id: conv2Id},
            {
                $set: {
                    participants: [adminObjectId, otherUserId],
                    messages: [msg2Id],
                    lastMessage: msg2Id
                }
            },
            {upsert: true}
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('GET /conversations (list)', () => {
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

        it('returns 200 and list of conversations (contains integration conversations)', async () => {
            const res = await request(app)
                .get('/conversations')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Conversations fetched successfully',
                conversations: expect.any(Array)
            }));

            // ensure at least one conversation includes the admin user
            const found = res.body.conversations.some(conv =>
                conv.participants && conv.participants.some(p => p && p.email === 'gabrielsalomon.980m@gmail.com')
            );
            expect(found).toBe(true);
        });

        it('returns 200 and mocked conversations when Conversation.find resolves', async () => {
            const mockedConversations = [
                {_id: 'c1', participants: [{_id: 'u1', name: 'User1', email: 'u1@test'}], lastMessage: {_id: 'm1', text: 'mock msg 1'}},
                {_id: 'c2', participants: [{_id: 'u2', name: 'User2', email: 'u2@test'}], lastMessage: {_id: 'm2', text: 'mock msg 2'}}
            ];
            jest.spyOn(Conversation, 'find').mockImplementationOnce(() => makePopulateMock(mockedConversations));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/conversations')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const lastMessages = res.body.conversations.map(c => c.lastMessage && c.lastMessage.text).filter(Boolean);
            expect(lastMessages).toEqual(expect.arrayContaining(['mock msg 1', 'mock msg 2']));
        });

        it('returns 500 when Conversation.find rejects', async () => {
            jest.spyOn(Conversation, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/conversations')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    describe('GET /conversations/:conversationId (single)', () => {
        let validToken;
        const existingConvId = '697a0000a9f9f488d664a001';

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

        it('returns 200 and the conversation details when found', async () => {
            const res = await request(app)
                .get(`/conversations/${existingConvId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Conversation fetched successfully',
                conversation: expect.objectContaining({
                    _id: existingConvId,
                    participants: expect.any(Array)
                })
            }));
        });

        it('returns 404 when the conversation is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Conversation, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .get(`/conversations/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({message: 'Conversation not found'}));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Conversation.findById rejects', async () => {
            const badId = '697a0000a9f9f488d664a0ff';
            jest.spyOn(Conversation, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .get(`/conversations/${badId}`)
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

