const request = require('supertest');
const app = require('./testUtils');
const Application = require('../models/application.model');
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
        // countDocuments used by controller: resolve with length when result is array
        countDocuments() {
            return shouldReject
                ? Promise.reject(result)
                : Promise.resolve(Array.isArray(result) ? result.length : 1);
        },
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

describe('Application Controller Tests', () => {
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

        // Ensure a job exists to attach applications to
        const jobId = new ObjectId('681b3c0f60a354792af26e35');
        await Job.updateOne(
            {_id: jobId},
            {
                $set: {
                    title: 'Integration Job for applications',
                    company: 'Integration Co',
                    location: 'Remote',
                    description: 'Job used by application tests',
                    requirements: ['Req1'],
                    creator: adminObjectId
                }
            },
            {upsert: true}
        );

        // create/upsert test applications tied to the job and admin user
        const app1Id = new ObjectId('789905bfa9f9f488d664e3a1');
        const app2Id = new ObjectId('789905bfa9f9f488d664e3a2');

        await Application.updateOne(
            {_id: app1Id},
            {
                $set: {
                    job: jobId,
                    applicant: adminObjectId,
                    resume: 'Integration application 1',
                    coverLetter: 'Cover letter 1',
                    status: 'pending'
                }
            },
            {upsert: true}
        );

        await Application.updateOne(
            {_id: app2Id},
            {
                $set: {
                    job: jobId,
                    applicant: adminObjectId,
                    resume: 'Integration application 2',
                    coverLetter: 'Cover letter 2',
                    status: 'reviewed'
                }
            },
            {upsert: true}
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('GET /applications (list)', () => {
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

        it('returns 200 and list of applications (contains integration applications)', async () => {
            const res = await request(app)
                .get('/applications')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                message: 'Applications fetched successfully',
                applications: expect.any(Array)
            }));

            const resumes = res.body.applications.map(a => a.resume);
            expect(resumes).toEqual(expect.arrayContaining(['Integration application 1', 'Integration application 2']));
        });

        it('returns 200 and mocked applications when Application.find resolves', async () => {
            const mockedApplications = [
                {_id: 'a1', resume: 'mock resume 1', job: {_id: 'j1'}, applicant: {_id: 'u1', name: 'User1'}},
                {_id: 'a2', resume: 'mock resume 2', job: {_id: 'j2'}, applicant: {_id: 'u2', name: 'User2'}}
            ];
            jest.spyOn(Application, 'find').mockImplementationOnce(() => makePopulateMock(mockedApplications));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/applications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            const resumes = res.body.applications.map(a => a.resume);
            expect(resumes).toEqual(expect.arrayContaining(['mock resume 1', 'mock resume 2']));
        });

        it('returns 500 when Application.find rejects', async () => {
            jest.spyOn(Application, 'find').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon.980m@gmail.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');
            const token = loginResponse.body.token;

            const res = await request(app)
                .get('/applications')
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

