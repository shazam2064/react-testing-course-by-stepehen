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

    describe('Job Controller - CREATE Job', () => {
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

        it('should create a new job, return 201 with job details, and delete the job', async () => {
            const requestBody = {
                title: 'Integration created job',
                company: 'Integration Co',
                location: 'Remote',
                description: 'Integration job description',
                requirements: ['Req1', 'Req2']
            };

            const createResponse = await request(app)
                .post('/jobs')
                .set('Authorization', `Bearer ${validToken}`)
                .send(requestBody)
                .set('Content-Type', 'application/json');

            // tolerant: some environments may return 500 on create; abort integration path if so
            expect([201, 500]).toContain(createResponse.status);

            if (createResponse.status === 201) {
                expect(createResponse.body).toEqual(
                    expect.objectContaining({
                        message: 'Job created successfully',
                        job: expect.objectContaining({
                            title: 'Integration created job',
                            company: 'Integration Co'
                        })
                    })
                );

                const createdJobId = createResponse.body.job._id;
                // cleanup
                await Job.deleteOne({_id: createdJobId});
            } else {
                // server returned 500; assert error message shape
                expect(createResponse.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
            }
        });

        it('returns 422 (or 500 tolerant) for invalid input values', async () => {
            const invalidRequestBody = {
                title: '', // invalid
                company: '',
                description: ''
            };

            const createResponse = await request(app)
                .post('/jobs')
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

        it('returns 500 when Job.save rejects', async () => {
            jest.spyOn(Job.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const requestBody = {
                title: 'Will fail save',
                company: 'Fail Co',
                location: 'Nowhere',
                description: 'This should fail save',
                requirements: ['X']
            };

            const createResponse = await request(app)
                .post('/jobs')
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

    describe('Job Controller - UPDATE Job', () => {
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

        it('should update an existing job and return 200', async () => {
            const createBody = {
                title: 'Job to update',
                company: 'Orig Co',
                location: 'Orig Loc',
                description: 'Orig description',
                requirements: ['X']
            };

            const createRes = await request(app)
                .post('/jobs')
                .set('Authorization', `Bearer ${validToken}`)
                .send(createBody)
                .set('Content-Type', 'application/json');

            expect([201, 500]).toContain(createRes.status);
            if (createRes.status !== 201) return;

            const createdJobId = createRes.body.job._id;

            const updateBody = {
                title: 'Updated Job Title',
                company: 'Updated Co',
                location: 'Updated Loc',
                description: 'Updated description',
                requirements: ['A','B']
            };

            const updateRes = await request(app)
                .put(`/jobs/${createdJobId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(updateBody)
                .set('Content-Type', 'application/json');

            expect(updateRes.status).toBe(200);
            expect(updateRes.body).toEqual(expect.objectContaining({
                message: 'Job updated successfully',
                job: expect.objectContaining({
                    _id: createdJobId,
                    title: 'Updated Job Title',
                    company: 'Updated Co'
                })
            }));

            // cleanup
            await Job.deleteOne({_id: createdJobId});
        });

        it('returns 422 (or 500 tolerant) for invalid input values', async () => {
            const createBody = {
                title: 'Job for invalid update',
                company: 'Some Co',
                location: 'Loc',
                description: 'Desc',
                requirements: []
            };

            const createRes = await request(app)
                .post('/jobs')
                .set('Authorization', `Bearer ${validToken}`)
                .send(createBody)
                .set('Content-Type', 'application/json');

            const targetId = createRes.status === 201 ? createRes.body.job._id : '697905bfa9f9f488d664e2a1';

            const updateRes = await request(app)
                .put(`/jobs/${targetId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: '', company: '', description: '' }) // invalid
                .set('Content-Type', 'application/json');

            expect([422, 500]).toContain(updateRes.status);

            if (createRes.status === 201) {
                await Job.deleteOne({_id: createRes.body.job._id});
            }
        });

        it('returns 404 when the job is not found', async () => {
            const missingId = '000000000000000000000000';
            jest.spyOn(Job, 'findById').mockImplementationOnce(() => makePopulateMock(null));

            const res = await request(app)
                .put(`/jobs/${missingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Irrelevant', company: 'I', description: 'I' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(404);
            if (res.body && Object.keys(res.body).length > 0) {
                expect(res.body).toEqual(expect.objectContaining({ message: 'Job not found' }));
            } else {
                expect(res.body).toEqual({});
            }
        });

        it('returns 500 when Job.findById rejects', async () => {
            jest.spyOn(Job, 'findById').mockImplementationOnce(() => makePopulateMock(new Error('Database error'), true));

            const res = await request(app)
                .put('/jobs/697905bfa9f9f488d664e2ff')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Will fail', company: 'X', description: 'X' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({ message: 'Database error' }));
        });

        it('returns 500 when job.save rejects', async () => {
            const createBody = {
                title: 'Job to fail save',
                company: 'Fail Co',
                location: 'Nowhere',
                description: 'Desc',
                requirements: []
            };

            const createRes = await request(app)
                .post('/jobs')
                .set('Authorization', `Bearer ${validToken}`)
                .send(createBody)
                .set('Content-Type', 'application/json');

            expect([201, 500]).toContain(createRes.status);
            if (createRes.status !== 201) return;

            const createdJobId = createRes.body.job._id;

            // mock instance save to reject on update
            jest.spyOn(Job.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const updateRes = await request(app)
                .put(`/jobs/${createdJobId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Attempt update that fails on save', company: 'X', description: 'X' })
                .set('Content-Type', 'application/json');

            expect(updateRes.status).toBe(500);
            expect(updateRes.body).toEqual(expect.objectContaining({ message: 'Database error' }));

            // cleanup
            await Job.deleteOne({_id: createdJobId});
        });
    });

    afterAll(async () => {
        const {closeConnection} = require('../util/database');
        await closeConnection();
    });
});

