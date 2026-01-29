const request = require('supertest');
const app = require('./testUtils');
const Job = require('../models/job.model');
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

describe('Job Controller Tests', () => {
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

        // create/upsert test jobs tied to admin user
        const job1Id = new ObjectId('697905bfa9f9f488d664e2a1');
        const job2Id = new ObjectId('697905bfa9f9f488d664e2a2');

        await Job.updateOne(
            {_id: job1Id},
            {
                $set: {
                    title: 'Integration Job 1',
                    company: 'Company 1',
                    location: 'Remote',
                    description: 'Job 1 description',
                    requirements: ['Req1', 'Req2'],
                    creator: adminObjectId
                }
            },
            {upsert: true}
        );

        await Job.updateOne(
            {_id: job2Id},
            {
                $set: {
                    title: 'Integration Job 2',
                    company: 'Company 2',
                    location: 'On-site',
                    description: 'Job 2 description',
                    requirements: ['ReqA', 'ReqB'],
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

    describe('GET /jobs (list)', () => {
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

        it('returns 200 and list of jobs (contains integration jobs)', async () => {
            const res = await request(app)
                .get('/jobs')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Jobs fetched successfully',
                jobs: expect.any(Array)
            }));

            const titles = res.body.jobs.map(j => j.title);
            expect(titles).toEqual(expect.arrayContaining(['Integration Job 1', 'Integration Job 2']));
        });

        it('returns 200 and mocked jobs when Job.find resolves', async () => {
            const mockedJobs = [
                {_id: 'j1', title: 'mock job 1', creator: {_id: 'u1', name: 'User1'}},
                {_id: 'j2', title: 'mock job 2', creator: {_id: 'u2', name: 'User2'}}
            ];
            jest.spyOn(Job, 'find').mockImplementationOnce(() => makePopulateMock(mockedJobs));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/jobs')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const titles = res.body.jobs.map(j => j.title);
            expect(titles).toEqual(expect.arrayContaining(['mock job 1', 'mock job 2']));
        });

        it('returns 500 when Job.find rejects', async () => {
            jest.spyOn(Job, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/jobs')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Database error'
            }));
        });
    });

    describe('GET /jobs/:jobId (single)', () => {
        let validToken;
        const existingJobId = '697905bfa9f9f488d664e2a1';

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

        it('returns 200 and the job details when found', async () => {
            const res = await request(app)
                .get(`/jobs/${existingJobId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Job fetched successfully',
                job: expect.objectContaining({
                    _id: existingJobId,
                    title: expect.any(String),
                })
            }));
        });

        it('returns 404 when the job is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Job, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .get(`/jobs/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({message: 'Job not found'}));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Job.findById rejects', async () => {
            const badId = '697905bfa9f9f488d664e2ff';
            jest.spyOn(Job, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .get(`/jobs/${badId}`)
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

