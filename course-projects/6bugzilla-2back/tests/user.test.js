const request = require('supertest');
const app = require('./testUtils');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

describe('User Controller Tests', () => {
    beforeAll(async () => {
        const { mongoConnect } = require('../util/database');
        await mongoConnect();

        const { ObjectId } = require('mongodb');
        const adminObjectId = new ObjectId('691c7d023d5b3fbd8397b1fe');

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
                $setOnInsert: {
                    _id: adminObjectId
                }
            },
            { upsert: true }
        );
    });

    describe('User Controller - GET Users', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should return 200 and a list of users', async () => {
            const mockUsers = [
                {
                    _id: '691c7d023d5b3fbd8397b1fe',
                    email: 'admin1@test.com',
                    name: 'User Test 1',
                    status: 'I am new!',
                    posts: [],
                    isAdmin: true,
                    createdAt: '2025-07-24T13:20:48.003Z',
                    updatedAt: '2025-07-24T13:20:48.003Z',
                },
            ];

            jest.spyOn(User, 'find').mockResolvedValueOnce(mockUsers);

            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Users fetched successfully',
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            _id: '691c7d023d5b3fbd8397b1fe',
                            email: 'admin1@test.com',
                            name: 'User Test 1',
                            status: 'I am new!',
                            isAdmin: true,
                        }),
                    ]),
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });


    describe('User Controller - GET User by ID', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should return 200 and the user details if the user exists', async () => {
            const mockUserId = '691c7d023d5b3fbd8397b1fe';

            // return a Query-like object with populate chain that resolves to the user
            jest.spyOn(User, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => Promise.resolve({
                        _id: mockUserId,
                        email: 'admin1@test.com',
                        password: '$2a$12$jHvfE9C.aKu3kpMys.Qd5Oh0xjoaRdsEqMThEAtoiElNuseSk4die',
                        name: 'User Test 1',
                        bugsAssigned: [],
                        reportedBugs: [],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-19T14:30:39.330Z',
                        __v: 0
                    })
                })
            }));

            const response = await request(app)
                .get(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User fetched successfully',
                    user: expect.objectContaining({
                        _id: mockUserId,
                        email: 'admin1@test.com',
                        name: 'User Test 1',
                        bugsAssigned: expect.any(Array),
                        reportedBugs: expect.any(Array),
                        isAdmin: true,
                    }),
                })
            );
        }, 20000);

        it('should return 404 if the user is not found', async () => {
            const mockUserId = '68ecfe5f977174350fab2a39';

            // mock findById to return a Query-like object whose populate resolves to null
            jest.spyOn(User, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => Promise.resolve(null)
                })
            }));

            const response = await request(app)
                .get(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User not found',
                })
            );
        }, 20000);

        it('should return 500 for invalid userId format (controller does not validate format)', async () => {
            const invalidUserId = 'notavalidid';

            const response = await request(app)
                .get(`/users/${invalidUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.any(String),
                })
            );
        }, 20000);

        it('should handle errors and return 500', async () => {
            const mockUserId = '68823330942eb86d6cf0f79d';

            // mock findById to return a Query-like object whose populate rejects
            jest.spyOn(User, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => Promise.reject(new Error('Database error'))
                })
            }));

            const response = await request(app)
                .get(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        }, 20000);
    });


    describe('User Controller - CREATE User', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should create a new user, return 201 with user details, and delete the user', async () => {
            const requestBody = {
                email: 'user2@test.com',
                name: 'User2',
                password: '123456',
                isAdmin: false,
            };

            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${validToken}`)
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(201);
            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    message: 'User created successfully',
                    user: expect.objectContaining({
                        email: 'user2@test.com',
                        name: 'User2',
                        isAdmin: false,
                    }),
                })
            );

            const createdUserId = createResponse.body.user._id;
            await User.deleteOne({ _id: createdUserId });
        });

        it('should return 422 for invalid input values', async () => {
            const invalidRequestBody = {
                email: '',
                name: '',
                password: '123',
                isAdmin: false,
            };

            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidRequestBody)
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(422);
            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Validation failed',
                })
            );
        });

        it('should return 500 if there is a server error', async () => {
            jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const requestBody = {
                email: 'user2@test.com',
                name: 'User2',
                password: '123456',
                isAdmin: false,
            };

            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${validToken}`)
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(500);
            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

    describe('User Controller - UPDATE User', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should create, update, and delete a user successfully', async () => {
            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    email: 'testuser@test.com',
                    name: 'Test User',
                    password: '123456',
                    isAdmin: false,
                })
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(201);
            const createdUserId = createResponse.body.user._id;

            const updateResponse = await request(app)
                .put(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    email: 'updateduser@test.com',
                    name: 'Updated User',
                    password: '654321',
                    status: 'Updated Status',
                    isAdmin: true,
                })
                .set('Content-Type', 'application/json');

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body).toEqual(
                expect.objectContaining({
                    message: 'User updated successfully',
                    user: expect.objectContaining({
                        _id: createdUserId,
                        email: 'updateduser@test.com',
                        name: 'Updated User',
                        isAdmin: true,
                    }),
                })
            );

            const deleteResponse = await request(app)
                .delete(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual(
                expect.objectContaining({
                    message: 'User deleted successfully',
                })
            );
        });


        it('should return 404 if the user is not found', async () => {
            const mockUserId = 'nonexistentUserId';

            jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .put(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    email: 'admin1@test.com',
                    name: '123456',
                    password: '123456',
                    status: 'Updated Status',
                    isAdmin: true,
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User not found',
                })
            );
        });

        // it('should handle errors and return 401 if the user is not admin', async () => {
        //     const mockUserId = '688bcd0d9f57fd677a6fe794';
        //
        //     jest.spyOn(User, 'findById').mockResolvedValueOnce({
        //         _id: mockUserId,
        //         email: 'oldemail@test.com',
        //         name: 'Old Name',
        //         status: 'Old Status',
        //         isAdmin: false,
        //         save: jest.fn(),
        //     });
        //
        //     const response = await request(app)
        //         .put(`/users/${mockUserId}`)
        //         .set('Authorization', `Bearer ${validToken}`)
        //         .send({
        //             email: '',
        //             name: '123456',
        //             password: '123456',
        //             status: 'Updated Status',
        //             isAdmin: true,
        //         })
        //         .set('Content-Type', 'application/json');
        //
        //     expect(response.status).toBe(401);
        //     expect(response.body).toEqual(
        //         expect.objectContaining({
        //             message: 'Access denied. Admins only.',
        //         })
        //     );
        // });

        it('should handle errors and return 500', async () => {
            const mockUserId = '688bcd0d9f57fd677a6fe794';

            jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    email: 'admin1@test.com',
                    name: '123456',
                    password: '123456',
                    status: 'Updated Status',
                    isAdmin: true,
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });


    describe('User Controller - DELETE User', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should create a user, delete it, and return 200 with a success message', async () => {
            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    email: 'dummyuser@test.com',
                    name: 'Dummy User',
                    password: '123456',
                    isAdmin: false,
                })
                .set('Content-Type', 'application/json');

            expect(createResponse.status).toBe(201);
            const createdUserId = createResponse.body.user._id;

            const deleteResponse = await request(app)
                .delete(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual(
                expect.objectContaining({
                    message: 'User deleted successfully',
                    result: expect.objectContaining({
                        _id: createdUserId,
                        email: 'dummyuser@test.com',
                    }),
                })
            );
        });

        it('should return 404 if the user does not exist', async () => {
            const nonExistentUserId = '000000000000000000000000';

            const response = await request(app)
                .delete(`/users/${nonExistentUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User not found',
                })
            );
        });

        it('should handle errors and return 500 on server error', async () => {
            const mockUserId = '688ccf9a0ab0514c3e06390f';

            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: mockUserId,
                email: 'dummyuser@test.com',
            });
            jest.spyOn(User, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete(`/users/${mockUserId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});
