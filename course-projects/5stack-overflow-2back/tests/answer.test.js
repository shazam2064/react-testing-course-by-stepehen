const request = require('supertest');
const app = require('./testUtils');
const Answer = require('../models/answer.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { mongoConnect, closeConnection } = require("../util/database");

describe('Answer Controller - GET Answers', () => {
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
                    status: 'I am new!',
                }
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

    it('should return 200 and a list of answers for a question', async () => {
        const mockQuestionId = '68ee68e62869fd5ce11a7c78';
        const mockAnswers = [
            {
                _id: '68efc054a0c73cb42c0d6a2c',
                content: 'This is the content of the new answer',
                votes: 0,
                questionId: mockQuestionId,
                creator: '68ecfe5f977174350fab2a37',
                voters: [],
                createdAt: '2025-10-15T15:40:04.461Z',
                updatedAt: '2025-10-15T15:40:04.461Z',
                __v: 0
            }
        ];

        jest.spyOn(Answer, 'find').mockResolvedValueOnce(mockAnswers);

        const response = await request(app)
            .get(`/answers/${mockQuestionId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Answers fetched successfully',
                answers: expect.arrayContaining([
                    expect.objectContaining({
                        _id: '68efc054a0c73cb42c0d6a2c',
                        content: 'This is the content of the new answer',
                        votes: 0,
                        questionId: mockQuestionId,
                        creator: '68ecfe5f977174350fab2a37',
                    })
                ])
            })
        );
    });

    it('should handle errors and return 500', async () => {
        const mockQuestionId = '68ee68e62869fd5ce11a7c78';
        jest.spyOn(Answer, 'find').mockImplementationOnce(() => Promise.reject(new Error('Database error')));

        const response = await request(app)
            .get(`/answers/${mockQuestionId}`)
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Database error'
            })
        );
    });
});

