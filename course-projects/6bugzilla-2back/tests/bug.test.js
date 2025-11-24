const request = require('supertest');
const app = require('./testUtils');
const Bug = require('../models/bug.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { mongoConnect, closeConnection } = require('../util/database');

describe('Bug Controller', () => {
    let validToken;

    beforeAll(async () => {
        await mongoConnect();

        const passwordHash = await bcrypt.hash('123456', 12);
        await User.updateOne(
            { email: 'admin1@test.com' },
            {
                $set: {
                    email: 'admin1@test.com',
                    password: passwordHash,
                    name: 'User Test 1',
                    isAdmin: true,
                },
            },
            { upsert: true }
        );

        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: 'admin1@test.com', password: '123456' })
            .set('Content-Type', 'application/json');

        expect(loginResponse.status).toBe(200);
        validToken = loginResponse.body.token;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await closeConnection();
    });

    describe('GET /bugs', () => {
        it('should return 200 and a list of bugs with total', async () => {
            const sampleBug = {
                product: '69208fd36fb0905085f395d5',
                component: '69247d9aad0e1c26b84eca02',
                summary: 'Bug summary',
                description: 'Detailed description of the bug',
                severity: 'Normal',
                priority: 'Low',
                version: 1,
                hardware: 'PC',
                os: 'Windows',
                status: 'Open',
                resolution: '',
                CC: [],
                assignee: '691c7d023d5b3fbd8397b1fe',
                reporter: '691c7d023d5b3fbd8397b1fe',
                deadline: '2023-12-31T23:59:59.000Z',
                hoursWorked: 0,
                hoursLeft: 10,
                dependencies: [],
                attachment: 'images/2025-11-24T16-11-23.769Z-book-1296045.png',
                comments: [],
                history: [],
                _id: '692483ab259bde177f30ab0b',
                createdAt: '2025-11-24T16:11:23.780Z',
                updatedAt: '2025-11-24T16:11:23.780Z',
                __v: 0
            };

            let findCall = 0;
            jest.spyOn(Bug, 'find').mockImplementation(() => {
                findCall += 1;
                if (findCall === 1) {
                    return { countDocuments: () => Promise.resolve(1) };
                }
                const query = {
                    populate() { return query; },
                    skip() { return query; },
                    limit() { return Promise.resolve([sampleBug]); }
                };
                return query;
            });

            const res = await request(app)
                .get('/bugs')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Bugs fetched successfully',
                    bugs: expect.arrayContaining([expect.objectContaining({ _id: sampleBug._id, summary: sampleBug.summary })]),
                    total: 1
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(Bug, 'find').mockImplementationOnce(() => ({
                countDocuments: () => Promise.reject(new Error('Database error')),
            }));

            const res = await request(app)
                .get('/bugs')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({ message: 'Database error' }));
        });
    });

    // Replace the GET /bugs/:bugId describe block with the updated tests
    {
        describe('GET /bugs/:bugId', () => {
            it('should return 200 and the bug details if found', async () => {
                const sampleBug = {
                    _id: '692483ab259bde177f30ab0b',
                    product: {
                        _id: '69208fd36fb0905085f395d5',
                        classification: '691dda59a581743f76150b0e',
                        name: 'Product 1',
                        description: 'This is the content of the first product',
                        version: 1,
                        components: ['69247d9aad0e1c26b84eca02'],
                        createdAt: '2025-11-21T16:14:11.629Z',
                        updatedAt: '2025-11-24T15:45:30.192Z',
                        __v: 1
                    },
                    component: {
                        _id: '69247d9aad0e1c26b84eca02',
                        product: '69208fd36fb0905085f395d5',
                        name: 'Component 1',
                        description: 'This is the content of the first component',
                        assignee: '691c7d023d5b3fbd8397b1fe',
                        CC: ['691c7d023d5b3fbd8397b1fe'],
                        bugs: ['692483ab259bde177f30ab0b'],
                        createdAt: '2025-11-24T15:45:30.123Z',
                        updatedAt: '2025-11-24T16:11:23.857Z',
                        __v: 1
                    },
                    summary: 'Bug summary',
                    description: 'Detailed description of the bug',
                    severity: 'Normal',
                    priority: 'Low',
                    version: 1,
                    hardware: 'PC',
                    os: 'Windows',
                    status: 'Open',
                    resolution: '',
                    CC: [],
                    assignee: {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        password: '$2a$12$6ufBBxQByVey8H4CWfRu8OqoQc3gQbE7Rgav7ARuFNYqUQ0hW1Kaq',
                        name: 'User Test 1',
                        bugsAssigned: ['692483ab259bde177f30ab0b'],
                        reportedBugs: ['692483ab259bde177f30ab0b'],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-24T16:14:56.629Z',
                        __v: 2
                    },
                    reporter: {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        password: '$2a$12$6ufBBxQByVey8H4CWfRu8OqoQc3gQbE7Rgav7ARuFNYqUQ0hW1Kaq',
                        name: 'User Test 1',
                        bugsAssigned: ['692483ab259bde177f30ab0b'],
                        reportedBugs: ['692483ab259bde177f30ab0b'],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-24T16:14:56.629Z',
                        __v: 2
                    },
                    deadline: '2023-12-31T23:59:59.000Z',
                    hoursWorked: 0,
                    hoursLeft: 10,
                    dependencies: [],
                    attachment: 'images/2025-11-24T16-11-23.769Z-book-1296045.png',
                    comments: [],
                    history: [],
                    createdAt: '2025-11-24T16:11:23.780Z',
                    updatedAt: '2025-11-24T16:11:23.780Z',
                    __v: 0
                };

                // mock findById to return a chainable query whose populate() returns same query and then() resolves to sampleBug
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() { return q; },
                        then(cb) { return Promise.resolve(sampleBug).then(cb); }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${sampleBug._id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Bug fetched successfully',
                        bug: expect.objectContaining({
                            _id: sampleBug._id,
                            summary: sampleBug.summary,
                            product: expect.objectContaining({ _id: sampleBug.product._id }),
                            component: expect.objectContaining({ _id: sampleBug.component._id }),
                            assignee: expect.objectContaining({ _id: sampleBug.assignee._id }),
                            reporter: expect.objectContaining({ _id: sampleBug.reporter._id })
                        })
                    })
                );
            });

            it('should return 404 if bug not found', async () => {
                const id = '000000000000000000000000';
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() { return q; },
                        then(cb) { return Promise.resolve(null).then(cb); }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(404);
                expect(res.body).toEqual(expect.objectContaining({ message: expect.stringContaining('Bug not found') }));
            });

            it('should handle errors and return 500', async () => {
                const id = '692483ab259bde177f30ab0b';
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() { return q; },
                        then() { return Promise.reject(new Error('Database error')); }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(expect.objectContaining({ message: 'Database error' }));
            });
        });
    }
});
