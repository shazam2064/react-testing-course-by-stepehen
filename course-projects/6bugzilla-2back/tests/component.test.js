const request = require('supertest');
const app = require('./testUtils');
const Component = require('../models/component.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { mongoConnect, closeConnection } = require('../util/database');

describe('Component Controller', () => {
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
            .send({
                email: 'admin1@test.com',
                password: '123456',
            })
            .set('Content-Type', 'application/json');

        expect(loginResponse.status).toBe(200);
        validToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await closeConnection();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Controller - GET Components', () => {
        it('should return 200 and a list of components', async () => {
            const mockComponents = [
                {
                    _id: '69247d9aad0e1c26b84eca02',
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
                    name: 'Component 1',
                    description: 'This is the content of the first component',
                    assignee: {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        name: 'User Test 1',
                        bugsAssigned: [],
                        reportedBugs: [],
                        isAdmin: true
                    },
                    CC: [
                        {
                            _id: '691c7d023d5b3fbd8397b1fe',
                            email: 'admin1@test.com',
                            name: 'User Test 1',
                            bugsAssigned: [],
                            reportedBugs: [],
                            isAdmin: true
                        }
                    ],
                    bugs: [],
                    createdAt: '2025-11-24T15:45:30.123Z',
                    updatedAt: '2025-11-24T15:45:30.123Z',
                    __v: 0
                }
            ];

            let findCall = 0;
            jest.spyOn(Component, 'find').mockImplementation(() => {
                findCall += 1;
                if (findCall === 1) {
                    return { countDocuments: () => Promise.resolve(mockComponents.length) };
                }
                return {
                    populate: () => ({
                        populate: () => ({
                            populate: () => ({
                                populate: () => ({
                                    skip: () => ({
                                        limit: () => Promise.resolve(mockComponents),
                                    }),
                                }),
                            }),
                        }),
                    }),
                };
            });

            const res = await request(app)
                .get('/components')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Components fetched successfully',
                    components: expect.arrayContaining([
                        expect.objectContaining({
                            _id: mockComponents[0]._id,
                            name: 'Component 1',
                            description: expect.any(String),
                        }),
                    ]),
                    total: mockComponents.length,
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(Component, 'find').mockImplementationOnce(() => ({
                countDocuments: () => Promise.reject(new Error('Database error')),
            }));

            const res = await request(app)
                .get('/components')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

    describe('Component Controller - GET Component by ID', () => {
        it('should return 200 and the component details if the component exists', async () => {
            const mockComponentId = '69247d9aad0e1c26b84eca02';
            const mockComponent = {
                _id: mockComponentId,
                product: {
                    _id: '69208fd36fb0905085f395d5',
                    name: 'Product 1'
                },
                name: 'Component 1',
                description: 'This is the content of the first component',
                assignee: {
                    _id: '691c7d023d5b3fbd8397b1fe',
                    email: 'admin1@test.com',
                    name: 'User Test 1'
                },
                CC: [],
                bugs: []
            };

            jest.spyOn(Component, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.resolve(mockComponent),
            }));

            const res = await request(app)
                .get(`/components/${mockComponentId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Component fetched successfully',
                    component: expect.objectContaining({
                        _id: mockComponentId,
                        name: 'Component 1',
                    }),
                })
            );
        });

        it('should return 404 if the component is not found', async () => {
            const mockComponentId = '691000000000000000000000';
            jest.spyOn(Component, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.resolve(null),
            }));

            const res = await request(app)
                .get(`/components/${mockComponentId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Component not found'),
                })
            );
        });

        it('should handle errors and return 500', async () => {
            const mockComponentId = '69247d9aad0e1c26b84eca02';
            jest.spyOn(Component, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.reject(new Error('Database error')),
            }));

            const res = await request(app)
                .get(`/components/${mockComponentId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

});

