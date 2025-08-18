const request = require('supertest');
const app= require('./testUtils');
const User = require('../models/user.model');

describe('Auth Controller', () => {
    beforeEach(() => {

    });

    describe('Auth Login', () => {
        it('should return 200 and a valid token with user details', async () => {
            const requestBody = {
                email: 'admin1@test.com',
                password: '123456',
            };

            const response = await request(app)
                .post('/auth/login')
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);

            expect(response.headers['content-type']).toMatch(/application\/json/);

            expect(response.body).toEqual(
                expect.objectContaining({
                    token: expect.any(String),
                    userId: expect.any(String),
                    email: 'admin1@test.com',
                    isAdmin: true,
                })
            );
        });

        it('should return 422 for invalid credentials', async () => {
            const requestBody = {
                email: 'admin1@test.com',
                password: 'wrongpassword',
            };

            const response = await request(app)
                .post('/auth/login')
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);

            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Wrong password',
                })
            );
        });
    });

    describe('Auth Signup', () => {
        it('should create a new user, return 201 with user details, and delete the user', async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin1@test.com',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');

            expect(loginResponse.status).toBe(200);
            const validToken = loginResponse.body.token;

            const requestBody = {
                email: 'admin3@test.com',
                name: 'User Test 3',
                password: '123456',
            };

            const response = await request(app)
                .put('/auth/signup')
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);

            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User created!',
                    userId: expect.any(String),
                })
            );

            const createdUserId = response.body.userId;

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

        it('should return 422 if the email address already exists', async () => {
            const requestBody = {
                email: 'admin1@test.com',
                name: 'User Test 1',
                password: '123456',
            };

            const response = await request(app)
                .put('/auth/signup')
                .send(requestBody)
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);

            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Validation failed, entered data is incorrect',
                    details: expect.arrayContaining([
                        expect.objectContaining({
                            type: 'field',
                            value: 'admin1@test.com',
                            msg: 'Email address already exists!',
                            path: 'email',
                            location: 'body',
                        }),
                    ]),
                })
            );
        });
    });

    describe('Auth GET Status', () => {
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

        it('should return 200 and the user status if the user exists', async () => {
            const mockUserId = 'validUserId';

            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: mockUserId,
                status: 'Active',
            });

            const response = await request(app)
                .get('/auth/status')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    status: 'Active',
                })
            );
        });

        it('should return 404 if the user is not found', async () => {
            jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .get('/auth/status')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'User not found',
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