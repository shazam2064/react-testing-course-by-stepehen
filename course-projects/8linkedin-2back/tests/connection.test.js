const request = require('supertest');
const app = require('./testUtils');
const Connection = require('../models/connection.model');
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

describe('Connection Controller Tests', () => {
    beforeAll(async () => {
        const {mongoConnect} = require('../util/database');
        await mongoConnect();

        const {ObjectId} = require('mongodb');
        const adminObjectId = new ObjectId('6972784f82b1d18304306cb9');
        const otherObjectId = new ObjectId('6972784f82b1d18304306cb8');
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

        await User.updateOne(
            {_id: otherObjectId},
            {
                $set: {
                    email: 'other.user@test.local',
                    password: passwordHash,
                    name: 'Other User',
                    isAdmin: false
                }
            },
            {upsert: true}
        );

        // upsert two connections involving admin and other user
        const conn1Id = new ObjectId('697905bfa9f9f488d664e2a1');
        const conn2Id = new ObjectId('697905bfa9f9f488d664e2a2');

        await Connection.updateOne(
            {_id: conn1Id},
            {
                $set: {
                    sender: adminObjectId,
                    receiver: otherObjectId,
                    status: 'pending'
                }
            },
            {upsert: true}
        );

        await Connection.updateOne(
            {_id: conn2Id},
            {
                $set: {
                    sender: otherObjectId,
                    receiver: adminObjectId,
                    status: 'accepted'
                }
            },
            {upsert: true}
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('GET /connections (list)', () => {
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

        it('returns 200 and list of connections (contains integration connections)', async () => {
            const res = await request(app)
                .get('/connections')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Connections fetched successfully',
                connections: expect.any(Array)
            }));

            // Instead of relying on id/email presence, assert the integration-upserted statuses exist.
            const statuses = res.body.connections.map(c => c.status);
            expect(statuses).toEqual(expect.arrayContaining(['pending', 'accepted']));
        });

        it('returns 200 and mocked connections when Connection.find resolves', async () => {
            const mockedConnections = [
                {_id: 'c1', sender: {_id: 'u1', name: 'User1'}, receiver: {_id: 'u2', name: 'User2'}, status: 'pending'},
                {_id: 'c2', sender: {_id: 'u3', name: 'User3'}, receiver: {_id: 'u1', name: 'User1'}, status: 'accepted'}
            ];
            jest.spyOn(Connection, 'find').mockImplementationOnce(() => makePopulateMock(mockedConnections));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/connections')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const ids = res.body.connections.map(c => c._id);
            expect(ids).toEqual(expect.arrayContaining(['c1', 'c2']));
        });

        it('returns 500 when Connection.find rejects', async () => {
            jest.spyOn(Connection, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/connections')
                .set('Authorization', `Bearer ${token}`);

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

