const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');

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
                _id: '68823330942eb86d6cf0f79d',
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
                        _id: '68823330942eb86d6cf0f79d',
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
        const mockUserId = '68823330942eb86d6cf0f79d';

        jest.spyOn(User, 'findById').mockResolvedValueOnce({
            _id: mockUserId,
            email: 'admin1@test.com',
            name: 'User Test 1',
            status: 'I am new!',
            posts: [],
            isAdmin: true,
            createdAt: '2025-07-24T13:20:48.003Z',
            updatedAt: '2025-07-24T13:20:48.003Z',
        });

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
                    status: 'I am new!',
                    isAdmin: true,
                }),
            })
        );
    });

    it('should return 404 if the user is not found', async () => {
        const mockUserId = 'nonexistentUserId';

        jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

        const response = await request(app)
            .get(`/users/${mockUserId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'User not found',
            })
        );
    });

    it('should handle errors and return 500', async () => {
        const mockUserId = '68823330942eb86d6cf0f79d';

        jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .get(`/users/${mockUserId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Database error',
            })
        );
    });
});


