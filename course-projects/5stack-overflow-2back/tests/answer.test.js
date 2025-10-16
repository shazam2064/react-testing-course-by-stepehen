const request = require('supertest');
const app = require('./testUtils');
const Answer = require('../models/answer.model');
const User = require('../models/user.model');
const Question = require('../models/question.model');
const bcrypt = require('bcryptjs');
const {mongoConnect, closeConnection} = require("../util/database");

describe('Question Controller', () => {
    let validToken;

    beforeAll(async () => {
        await mongoConnect();

        const passwordHash = await bcrypt.hash('123456', 12);
        await User.updateOne(
            {email: 'admin1@test.com'},
            {
                $set: {
                    email: 'admin1@test.com',
                    password: passwordHash,
                    name: 'User Test 1',
                    isAdmin: true,
                    status: 'I am new!',
                }
            },
            {upsert: true}
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

    describe('Answer Controller - GET Answers', () => {
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

    describe('Answer Controller - CREATE Answer', () => {
        it('should create a new answer and return 201 with details', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            const mockAnswer = {
                _id: '68efc054a0c73cb42c0d6a2c',
                content: 'This is the content of the new answer',
                votes: 0,
                questionId: mockQuestionId,
                creator: '68ecfe5f977174350fab2a37',
                voters: [],
                createdAt: '2025-10-15T15:40:04.461Z',
                updatedAt: '2025-10-15T15:40:04.461Z',
                __v: 0
            };

            jest.spyOn(Answer.prototype, 'save').mockResolvedValueOnce(mockAnswer);
            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: '68ecfe5f977174350fab2a37',
                name: 'User Test 1',
                answers: {push: jest.fn()},
                save: jest.fn().mockResolvedValueOnce({}),
            });
            jest.spyOn(Question, 'findById').mockResolvedValueOnce({
                answers: {push: jest.fn()},
                save: jest.fn().mockResolvedValueOnce({}),
            });

            const response = await request(app)
                .post('/answers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'This is the content of the new answer',
                    questionId: mockQuestionId
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);

            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Answer created successfully',
                    answer: expect.objectContaining({
                        content: mockAnswer.content,
                        questionId: mockQuestionId,
                        votes: expect.any(Number),
                        voters: expect.any(Array),
                        creator: '68ecfe5f977174350fab2a37',
                    }),
                    creator: expect.objectContaining({
                        _id: '68ecfe5f977174350fab2a37'
                    })
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const response = await request(app)
                .post('/answers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: '',
                    questionId: ''
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Validation failed')
                })
            );
        });

        it('should return 500 if there is a server error', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            jest.spyOn(Answer.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/answers')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'This is the content of the new answer',
                    questionId: mockQuestionId
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });
});
