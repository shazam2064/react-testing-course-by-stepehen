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
                    password: '$2a$12$CuRoR9eFyaEJ.6wj4zihrOdCvPbK4OF9PuaaJ9TpTPyhP9.C40gdm',
                    name: 'User Test 1',
                    bugsAssigned: [],
                    reportedBugs: [],
                    isAdmin: true,
                    createdAt: '2025-11-18T14:04:50.796Z',
                    updatedAt: '2025-11-24T15:47:37.917Z',
                    __v: 0
                },
                CC: [
                    {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        password: '$2a$12$CuRoR9eFyaEJ.6wj4zihrOdCvPbK4OF9PuaaJ9TpTPyhP9.C40gdm',
                        name: 'User Test 1',
                        bugsAssigned: [],
                        reportedBugs: [],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-24T15:47:37.917Z',
                        __v: 0
                    }
                ],
                bugs: [],
                createdAt: '2025-11-24T15:45:30.123Z',
                updatedAt: '2025-11-24T15:45:30.123Z',
                __v: 0
            };

            jest.spyOn(Component, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => ({
                        populate: () => ({
                            populate: () => Promise.resolve(mockComponent)
                        })
                    })
                })
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
                        product: expect.objectContaining({
                            _id: '69208fd36fb0905085f395d5',
                            name: 'Product 1'
                        }),
                        assignee: expect.objectContaining({
                            _id: '691c7d023d5b3fbd8397b1fe',
                            email: 'admin1@test.com'
                        }),
                        CC: expect.arrayContaining([
                            expect.objectContaining({ _id: '691c7d023d5b3fbd8397b1fe' })
                        ])
                    })
                })
            );
        });

        it('should return 404 if the component is not found', async () => {
            const mockComponentId = '691000000000000000000000';
            jest.spyOn(Component, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => ({
                        populate: () => ({
                            populate: () => Promise.resolve(null)
                        })
                    })
                })
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
                populate: () => ({
                    populate: () => ({
                        populate: () => ({
                            populate: () => Promise.reject(new Error('Database error'))
                        })
                    })
                })
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

    describe('Component Controller - CREATE Component', () => {
        it('should create a component and return 201 with details', async () => {
            const productId = '69208fd36fb0905085f395d5';
            const assigneeId = '691c7d023d5b3fbd8397b1fe';

            jest.spyOn(Component.prototype, 'save').mockResolvedValueOnce({
                _id: '69247f6c4e56e09e84a5c834',
                product: productId,
                name: 'Component 1',
                description: 'This is the content of the first component',
                assignee: assigneeId,
                CC: [assigneeId],
                bugs: []
            });

            const mockProduct = {
                _id: productId,
                components: [],
                save: jest.fn().mockResolvedValueOnce({})
            };
            jest.spyOn(Product, 'findById').mockResolvedValueOnce(mockProduct);

            jest.spyOn(User, 'findById').mockResolvedValueOnce({ email: 'admin1@test.com' });

            const res = await request(app)
                .post('/components')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    product: productId,
                    name: 'Component 1',
                    description: 'This is the content of the first component',
                    assignee: assigneeId,
                    CC: [assigneeId]
                })
                .set('Content-Type', 'application/json');

            expect(Component.prototype.save).toHaveBeenCalled();
            expect(Product.findById).toHaveBeenCalledWith(productId);
            expect(res.status).toBe(201);

            // Relaxed assertions: check important fields and allow assignee to be id or populated object
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Component created successfully',
                    component: expect.objectContaining({
                        name: 'Component 1',
                        product: productId,
                        description: expect.any(String),
                        CC: expect.any(Array)
                    })
                })
            );

            const comp = res.body.component;
            // CC should contain the assignee id
            expect(comp.CC).toContain(assigneeId);
            // assignee may be id or object; handle both
            if (typeof comp.assignee === 'string') {
                expect(comp.assignee).toBe(assigneeId);
            } else {
                expect(comp.assignee).toEqual(expect.objectContaining({ _id: assigneeId }));
            }
        });

        it('should return 422 for invalid input', async () => {
            const res = await request(app)
                .post('/components')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    product: '',
                    name: '',
                    description: '',
                    assignee: '',
                    CC: []
                })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(422);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Validation failed')
                })
            );
        });

        it('should return 500 if there is a server error during creation', async () => {
            const productId = '69208fd36fb0905085f395d5';

            jest.spyOn(Component.prototype, 'save').mockRejectedValueOnce(new Error('Database error during save'));

            const res = await request(app)
                .post('/components')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    product: productId,
                    name: 'Component 1',
                    description: 'This is the content of the first component',
                    assignee: '691c7d023d5b3fbd8397b1fe',
                    CC: ['691c7d023d5b3fbd8397b1fe']
                })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Database error during save'
                })
            );
        });
    });

});
