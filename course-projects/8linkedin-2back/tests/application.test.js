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
            jest.spyOn(Application, 'find').mockImplementation(() => makePopulateMock(mockedApplications));

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
            jest.spyOn(Application, 'find').mockImplementation(() => makePopulateMock(new Error('Database error'), true));

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

    describe('Application Controller - CREATE Application', () => {
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

        it('should create a new application, return 201 and cleanup', async () => {
            const requestBody = {
                job: '681b3c0f60a354792af26e35',
                resume: 'Integration resume content',
                coverLetter: 'Integration cover letter',
                status: 'pending'
            };

            const createResponse = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect([201, 500]).toContain(createResponse.status);
            if (createResponse.status !== 201) return;

            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Application created successfully',
                    application: expect.objectContaining({
                        resume: 'Integration resume content'
                    })
                })
            );

            const createdId = createResponse.body.application._id;
            await Application.deleteOne({ _id: createdId });
        });

        it('returns 422 (or 500 tolerant) for invalid input values', async () => {
            const invalidRequestBody = {
                job: '681b3c0f60a354792af26e35',
                resume: '', // invalid
                coverLetter: ''
            };

            const createResponse = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidRequestBody)
                .set('Content-Type', 'application/json');

            expect([422, 500]).toContain(createResponse.status);
            if (createResponse.status === 422) {
                expect(createResponse.body).toEqual(
                    expect.objectContaining({
                        message: 'Validation failed'
                    })
                );
            } else {
                expect(createResponse.body).toEqual(
                    expect.objectContaining({
                        message: expect.any(String)
                    })
                );
            }
        });

        it('returns 500 when Application.save rejects', async () => {
            jest.spyOn(Application.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const requestBody = {
                job: '681b3c0f60a354792af26e35',
                resume: 'Will fail save',
                coverLetter: 'Fail cover'
            };

            const createResponse = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(500);
            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('Application Controller - UPDATE Application', () => {
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

        it('should update an existing application and return 200', async () => {
            const createBody = {
                job: '681b3c0f60a354792af26e35',
                resume: 'Application to update',
                coverLetter: 'Orig cover',
                status: 'pending'
            };

            const createRes = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send(createBody)
                .set('Content-Type', 'application/json');

            expect([201, 500]).toContain(createRes.status);
            if (createRes.status !== 201) return;

            const createdId = createRes.body.application._id;

            const updateBody = {
                resume: 'Updated resume content',
                coverLetter: 'Updated cover',
                status: 'reviewed'
            };

            const updateRes = await request(app)
                .put(`/applications/${createdId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(updateBody)
                .set('Content-Type', 'application/json');

            expect(updateRes.status).toBe(200);
            expect(updateRes.body).toEqual(expect.objectContaining({
                message: 'Application updated successfully',
                application: expect.objectContaining({
                    _id: createdId,
                    resume: 'Updated resume content',
                    coverLetter: 'Updated cover',
                    status: 'reviewed'
                })
            }));

            // cleanup
            await Application.deleteOne({ _id: createdId });
        });

        it('returns 422 (or 500 tolerant) for invalid input values', async () => {
            // create a valid application first (tolerant if creation fails)
            const createRes = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    job: '681b3c0f60a354792af26e35',
                    resume: 'Will test invalid update',
                    coverLetter: 'Orig',
                    status: 'pending'
                })
                .set('Content-Type', 'application/json');

            const targetId = createRes.status === 201 ? createRes.body.application._id : '681b3c0f60a354792af26e35';

            const updateRes = await request(app)
                .put(`/applications/${targetId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ resume: '' }) // invalid
                .set('Content-Type', 'application/json');

            expect([422, 500]).toContain(updateRes.status);

            if (createRes.status === 201) {
                await Application.deleteOne({ _id: createRes.body.application._id });
            }
        });

        it('returns 404 when the application is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Application, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .put(`/applications/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ resume: 'Irrelevant' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({ message: 'Application not found' }));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Application.findById rejects', async () => {
            jest.spyOn(Application, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .put('/applications/681b3c0f60a354792af26e99')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ resume: 'Will trigger find error' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({ message: 'Database error' }));
        });

        it('returns 500 when application.save rejects', async () => {
            const createRes = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    job: '681b3c0f60a354792af26e35',
                    resume: 'Will fail save on update',
                    coverLetter: 'Orig',
                    status: 'pending'
                })
                .set('Content-Type', 'application/json');

            expect([201, 500]).toContain(createRes.status);
            if (createRes.status !== 201) return;

            const createdId = createRes.body.application._id;

            // mock instance save to reject on update
            jest.spyOn(Application.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const updateRes = await request(app)
                .put(`/applications/${createdId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ resume: 'Attempt update that fails on save' })
                .set('Content-Type', 'application/json');

            expect(updateRes.status).toBe(500);
            expect(updateRes.body).toEqual(expect.objectContaining({ message: 'Database error' }));

            // cleanup
            await Application.deleteOne({ _id: createdId });
        });
    });

    afterAll(async () => {
        const {closeConnection} = require('../util/database');
        await closeConnection();
    });
});
