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

    describe('Answer Controller - UPDATE Answer', () => {
        it('should update an answer and return 200 with updated details', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            const mockAnswer = {
                _id: mockAnswerId,
                content: 'Old content',
                creator: '68ecfe5f977174350fab2a37',
                save: jest.fn().mockResolvedValueOnce({
                    _id: mockAnswerId,
                    content: 'Updated content',
                    creator: '68ecfe5f977174350fab2a37'
                })
            };

            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(mockAnswer);

            const response = await request(app)
                .put(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Answer updated successfully',
                    answer: expect.objectContaining({
                        _id: mockAnswerId,
                        content: 'Updated content',
                        creator: '68ecfe5f977174350fab2a37'
                    })
                })
            );
        });

        it('should return 404 if the answer is not found', async () => {
            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .put('/answers/unknownid')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Answer not found')
                })
            );
        });

        it('should return 403 if not authorized', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            const mockAnswer = {
                _id: mockAnswerId,
                content: 'Old content',
                creator: 'differentUserId',
                save: jest.fn()
            };

            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(mockAnswer);

            const response = await request(app)
                .put(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Not authorized')
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            jest.spyOn(Answer, 'findById').mockResolvedValueOnce({
                _id: mockAnswerId,
                content: 'Old content',
                creator: '68ecfe5f977174350fab2a37',
                save: jest.fn()
            });

            const response = await request(app)
                .put(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: ''
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
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            jest.spyOn(Answer, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    content: 'Updated content'
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

    describe('Answer Controller - DELETE Answer', () => {
        it('should delete an answer and return 200 with message', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            const mockAnswer = {
                _id: mockAnswerId,
                creator: '68ecfe5f977174350fab2a37'
            };

            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(mockAnswer);
            jest.spyOn(Answer, 'findByIdAndDelete').mockResolvedValueOnce(mockAnswer);
            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                answers: { pull: jest.fn() },
                save: jest.fn().mockResolvedValueOnce({})
            });

            const response = await request(app)
                .delete(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Answer deleted successfully'
                })
            );
        });

        it('should return 404 if the answer is not found', async () => {
            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .delete('/answers/unknownid')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Answer not found')
                })
            );
        });

        it('should return 403 if not authorized', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            const mockAnswer = {
                _id: mockAnswerId,
                creator: 'differentUserId'
            };

            jest.spyOn(Answer, 'findById').mockResolvedValueOnce(mockAnswer);

            const response = await request(app)
                .delete(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Not authorized')
                })
            );
        });

        it('should return 500 if there is a server error', async () => {
            const mockAnswerId = '68efc054a0c73cb42c0d6a2c';
            jest.spyOn(Answer, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete(`/answers/${mockAnswerId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });
});
