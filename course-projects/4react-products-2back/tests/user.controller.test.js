const request = require('supertest');
const app = require('../app'); // Ensure app.js exports the Express app
const User = require('../models/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

jest.mock('../models/user.model');

describe('User Controller', () => {
    let authToken;

    beforeAll(async () => {
        // Mock user authentication and get a token
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com', password: '123456' });
        authToken = response.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /users', () => {
        it('should fetch a list of users', async () => {
            User.find.mockResolvedValue([{ email: 'user@test.com', name: 'User1' }]);

            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Users fetched successfully');
            expect(response.body.users).toHaveLength(1);
        });
    });

    describe('GET /users/:userId', () => {
        it('should fetch a user by ID', async () => {
            User.findById.mockResolvedValue({ email: 'user@test.com', name: 'User1' });

            const response = await request(app)
                .get('/users/validUserId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User fetched successfully');
            expect(response.body.user.email).toBe('user@test.com');
        });

        it('should return 404 if user is not found', async () => {
            User.findById.mockResolvedValue(null);

            const response = await request(app)
                .get('/users/invalidUserId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
            User.prototype.save = jest.fn().mockResolvedValue({
                email: 'user2@test.com',
                name: 'User2',
                isAdmin: false,
            });

            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'user2@test.com',
                    name: 'User2',
                    password: '123456',
                    isAdmin: false,
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User created successfully');
            expect(response.body.user.email).toBe('user2@test.com');
        });
    });

    describe('PUT /users/:userId', () => {
        it('should update a user', async () => {
            User.findById.mockResolvedValue({
                email: 'user@test.com',
                name: 'User1',
                save: jest.fn().mockResolvedValue({
                    email: 'updated@test.com',
                    name: 'Updated User',
                    isAdmin: true,
                }),
            });

            const response = await request(app)
                .put('/users/validUserId')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'updated@test.com',
                    name: 'Updated User',
                    password: '123456',
                    isAdmin: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User updated successfully');
            expect(response.body.user.email).toBe('updated@test.com');
        });
    });

    describe('DELETE /users/:userId', () => {
        it('should delete a user', async () => {
            User.findById.mockResolvedValue({
                email: 'user@test.com',
                name: 'User1',
            });
            User.findByIdAndDelete.mockResolvedValue();

            const response = await request(app)
                .delete('/users/validUserId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully');
        });
    });
});