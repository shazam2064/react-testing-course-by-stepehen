const request = require('supertest');
const app = require('./testUtils');
const Question = require('../models/question.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

describe('Question Controller - GET Questions', () => {
    let validToken;

    beforeAll(async () => {
        const { mongoConnect } = require('../util/database');
        await mongoConnect();

        // Ensure admin1@test.com exists for login
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

    it('should return 200 and a list of questions', async () => {
        const mockQuestions = [
            {
                _id: '68ee68e62869fd5ce11a7c78',
                title: 'This is a question',
                content: 'So much content in this question',
                votes: 0,
                views: 0,
                tags: [
                    '67289ce5fed4ea2d6963afb7',
                    '67289cecfed4ea2d6963afb9'
                ],
                answers: [],
                creator: '68ecfe5f977174350fab2a37',
                voters: [],
                createdAt: '2025-10-14T15:14:46.960Z',
                updatedAt: '2025-10-14T15:14:46.960Z',
                __v: 0
            }
        ];

        jest.spyOn(Question, 'find').mockImplementation(() => ({
            countDocuments: () => Promise.resolve(mockQuestions.length),
        }));

        jest.spyOn(Question, 'find').mockImplementationOnce(() => ({
            populate: () => ({
                populate: () => ({
                    populate: () => ({
                        skip: () => ({
                            limit: () => Promise.resolve(mockQuestions),
                        }),
                    }),
                }),
            }),
        }));

        const response = await request(app)
            .get('/questions')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Questions fetched successfully',
                questions: expect.arrayContaining([
                    expect.objectContaining({
                        _id: '68ee68e62869fd5ce11a7c78',
                        title: 'This is a question',
                        content: 'So much content in this question',
                        votes: 0,
                        views: 0,
                        tags: [
                            '67289ce5fed4ea2d6963afb7',
                            '67289cecfed4ea2d6963afb9'
                        ],
                        answers: [],
                        creator: '68ecfe5f977174350fab2a37',
                        voters: [],
                        createdAt: '2025-10-14T15:14:46.960Z',
                        updatedAt: '2025-10-14T15:14:46.960Z',
                        __v: 0
                    }),
                ]),
                total: mockQuestions.length,
            })
        );
    });

    it('should handle errors and return 500', async () => {
        jest.spyOn(Question, 'find').mockImplementation(() => ({
            countDocuments: () => Promise.reject(new Error('Database error')),
        }));

        const response = await request(app)
            .get('/questions')
            .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Database error',
            })
        );
    });

    afterAll(async () => {
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});
