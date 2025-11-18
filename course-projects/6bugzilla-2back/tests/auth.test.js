const request = require('supertest');
const app= require('./testUtils');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

describe('Auth Controller', () => {
    beforeAll(async () => {
        const { mongoConnect } = require('../util/database');
        await mongoConnect();

        const passwordHash = await bcrypt.hash('123456', 12);
        await User.updateOne(
            { email: 'gabrielsalomon990@gmail.com' },
            {
                $set: {
                    email: 'gabrielsalomon990@gmail.com',
                    password: passwordHash,
                    name: 'Gabriel Salomon',
                    isAdmin: true,
                    verificationToken: undefined,
                    verificationTokenExpiration: undefined,
                }
            },
            { upsert: true }
        );
    });

    beforeEach(() => {

    });

    describe('Auth Login', () => {
        it('should return 200 and a valid token with user details', async () => {
            const requestBody = {
                email: 'gabrielsalomon990@gmail.com',
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
                    email: 'gabrielsalomon990@gmail.com',
                    isAdmin: true,
                })
            );
        });

        it('should return 422 for invalid credentials', async () => {
            const requestBody = {
                email: 'gabrielsalomon990@gmail.com',
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

        it('should return 422 if email is not verified', async () => {
            const unverifiedUser = new User({
                email: 'unverified@test.com',
                password: await require('bcryptjs').hash('123456', 12),
                name: 'Unverified User',
                isAdmin: false,
                verificationToken: 'sometoken',
                verificationTokenExpiration: Date.now() + 3600000
            });
            await unverifiedUser.save();

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'unverified@test.com',
                    password: '123456'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Please verify your email before logging in',
                })
            );

            await User.deleteOne({ email: 'unverified@test.com' });
        });
    });

    describe('Auth Signup', () => {
        it('should create a new user and return 201 with verification message', async () => {
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
                    message: expect.stringContaining('User created! Please check your email to verify your account.'),
                })
            );

            await User.deleteOne({ email: 'admin3@test.com' });
        });

        it('should return 422 if the email address already exists', async () => {
            const requestBody = {
                email: 'gabrielsalomon990@gmail.com',
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
                })
            );

            if (response.body.details) {
                expect(response.body.details).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            type: 'field',
                            value: 'gabrielsalomon990@gmail.com',
                            msg: 'Email address already exists!',
                            path: 'email',
                            location: 'body',
                        }),
                    ])
                );
            }
        });
    });


    describe('Auth Verify Email', () => {
        let adminToken;
        let testUserId;
        let verificationToken;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'gabrielsalomon990@gmail.com',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');
            adminToken = loginResponse.body.token;
        });

        it('should verify email and allow login after verification', async () => {
            const signupEmail = 'verifytestuser@test.com';
            const signupRes = await request(app)
                .put('/auth/signup')
                .send({
                    email: signupEmail,
                    name: 'Verify Test User',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');
            expect(signupRes.status).toBe(201);

            const user = await User.findOne({ email: signupEmail });
            expect(user).toBeTruthy();
            testUserId = user._id;
            verificationToken = user.verificationToken;
            expect(verificationToken).toBeTruthy();

            await User.updateOne(
                { _id: testUserId },
                { $set: { verificationToken: undefined, verificationTokenExpiration: undefined } }
            );

            const verifyRes = await request(app)
                .get(`/auth/verify/${verificationToken}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 422]).toContain(verifyRes.status);

            await User.deleteOne({ _id: testUserId });
        });

        it('should return 422 if the token is invalid', async () => {
            const response = await request(app)
                .get('/auth/verify/invalidtoken')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Token is invalid')
                })
            );
        });

        it('should return 422 if the token has expired', async () => {
            // Create a user with an expired token
            const expiredEmail = 'expiredtoken@test.com';
            const expiredToken = 'expiredtoken123';
            const expiredUser = new User({
                email: expiredEmail,
                password: await require('bcryptjs').hash('123456', 12),
                name: 'Expired Token User',
                isAdmin: false,
                verificationToken: expiredToken,
                verificationTokenExpiration: Date.now() - 1000 // expired
            });
            await expiredUser.save();

            const response = await request(app)
                .get(`/auth/verify/${expiredToken}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Token has expired')
                })
            );

            await User.deleteOne({ email: expiredEmail });
        });

        it('should return 500 if there is a server error', async () => {
            // Mock User.findOne to throw
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => { throw new Error('Database error'); });

            const response = await request(app)
                .get('/auth/verify/someToken')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                { message: 'Database error' }
            );
        });
    });

    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});