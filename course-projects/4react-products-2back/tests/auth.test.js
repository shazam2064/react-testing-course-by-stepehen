const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');

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

        // Assert the correct status code
        expect(response.status).toBe(422);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Wrong password',
            })
        );
    });
});


