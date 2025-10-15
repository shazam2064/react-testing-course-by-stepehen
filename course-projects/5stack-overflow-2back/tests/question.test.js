const request = require('supertest');
const app = require('./testUtils');
const Question = require('../models/question.model');
const User = require('../models/user.model');
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

    describe('Question Controller - GET Questions', () => {
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
            jest.spyOn(Question, 'find').mockImplementation(() => {
                throw new Error('Database error');
            });

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
    });

    describe('Question Controller - GET Question by ID', () => {
        it('should return 200 and the question details if the question exists', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            const mockQuestion = {
                _id: mockQuestionId,
                title: 'This is a question',
                content: 'So much content in this question',
                votes: 0,
                views: 0,
                tags: [
                    '67289ce5fed4ea2d6963afb7',
                    '67289cecfed4ea2d6963afb9'
                ],
                answers: [],
                creator: {_id: '68ecfe5f977174350fab2a37', name: 'User Test 1'},
                voters: [],
                createdAt: '2025-10-14T15:14:46.960Z',
                updatedAt: '2025-10-14T15:14:46.960Z',
                __v: 0,
                save: jest.fn().mockResolvedValueOnce({
                    _id: mockQuestionId,
                    title: 'This is a question',
                    content: 'So much content in this question',
                    votes: 0,
                    views: 0.5,
                    tags: [
                        '67289ce5fed4ea2d6963afb7',
                        '67289cecfed4ea2d6963afb9'
                    ],
                    answers: [],
                    creator: {_id: '68ecfe5f977174350fab2a37', name: 'User Test 1'},
                    voters: [],
                    createdAt: '2025-10-14T15:14:46.960Z',
                    updatedAt: '2025-10-14T15:14:46.960Z',
                    __v: 0,
                })
            };

            jest.spyOn(Question, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => ({
                        populate: () => Promise.resolve(mockQuestion)
                    })
                })
            }));

            const response = await request(app)
                .get(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Question fetched',
                    question: expect.objectContaining({
                        _id: mockQuestionId,
                        title: 'This is a question',
                        content: 'So much content in this question',
                        creator: expect.objectContaining({
                            _id: '68ecfe5f977174350fab2a37',
                            name: 'User Test 1'
                        }),
                    }),
                })
            );
        });

        it('should return 404 if the question is not found', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c79';

            jest.spyOn(Question, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => ({
                        populate: () => Promise.resolve(null)
                    })
                })
            }));

            const response = await request(app)
                .get(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Could not find the question'),
                })
            );
        });

        it('should handle errors and return 500', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';

            jest.spyOn(Question, 'findById').mockImplementationOnce(() => ({
                populate: () => ({
                    populate: () => ({
                        populate: () => Promise.reject(new Error('Database error'))
                    })
                })
            }));

            const response = await request(app)
                .get(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

    describe('Question Controller - CREATE Question', () => {
        it('should create a new question and return 201 with details', async () => {
            const mockQuestion = {
                _id: '68ee68e62869fd5ce11a7c78',
                title: 'New Question',
                content: 'Question content',
                tags: ['67289ce5fed4ea2d6963afb7'],
                creator: '68ecfe5f977174350fab2a37',
                save: jest.fn().mockResolvedValueOnce(this),
            };
            jest.spyOn(Question.prototype, 'save').mockResolvedValueOnce(mockQuestion);
            jest.spyOn(User, 'findById').mockResolvedValueOnce({
                _id: '68ecfe5f977174350fab2a37',
                name: 'User Test 1',
                questions: { push: jest.fn() },
                save: jest.fn().mockResolvedValueOnce({}),
            });
            jest.spyOn(require('../models/tag.model'), 'find').mockResolvedValueOnce([
                { questions: { push: jest.fn() }, save: jest.fn() }
            ]);

            const response = await request(app)
                .post('/questions')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: 'New Question',
                    content: 'Question content',
                    tags: ['67289ce5fed4ea2d6963afb7']
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Question created successfully',
                    question: expect.objectContaining({
                        title: 'New Question',
                        content: 'Question content',
                        tags: ['67289ce5fed4ea2d6963afb7'],
                    }),
                    creator: expect.objectContaining({
                        _id: '68ecfe5f977174350fab2a37',
                        name: 'User Test 1'
                    })
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const response = await request(app)
                .post('/questions')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: '',
                    content: '',
                    tags: []
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
            jest.spyOn(Question.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/questions')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: 'New Question',
                    content: 'Question content',
                    tags: ['67289ce5fed4ea2d6963afb7']
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

    describe('Question Controller - UPDATE Question', () => {
        it('should update a question and return 200 with updated details', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            const mockQuestion = {
                _id: mockQuestionId,
                title: 'Old Title',
                content: 'Old Content',
                tags: ['67289ce5fed4ea2d6963afb7'],
                creator: '68ecfe5f977174350fab2a37',
                save: jest.fn().mockResolvedValueOnce({
                    _id: mockQuestionId,
                    title: 'Updated Title',
                    content: 'Updated Content',
                    tags: ['67289ce5fed4ea2d6963afb7'],
                    creator: '68ecfe5f977174350fab2a37'
                }),
            };

            jest.spyOn(Question, 'findById').mockResolvedValueOnce(mockQuestion);

            const response = await request(app)
                .put(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: 'Updated Title',
                    content: 'Updated Content',
                    tags: ['67289ce5fed4ea2d6963afb7']
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Question updated successfully',
                    question: expect.objectContaining({
                        title: 'Updated Title',
                        content: 'Updated Content',
                        tags: ['67289ce5fed4ea2d6963afb7'],
                        creator: '68ecfe5f977174350fab2a37'
                    }),
                })
            );
        });

        it('should return 404 if the question is not found', async () => {
            jest.spyOn(Question, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .put('/questions/unknownid')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: 'Updated Title',
                    content: 'Updated Content',
                    tags: ['67289ce5fed4ea2d6963afb7']
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Could not find the question'),
                })
            );
        });

        it('should return 403 if not authorized', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            const mockQuestion = {
                _id: mockQuestionId,
                title: 'Old Title',
                content: 'Old Content',
                tags: ['67289ce5fed4ea2d6963afb7'],
                creator: 'differentUserId',
                save: jest.fn(),
            };

            jest.spyOn(Question, 'findById').mockResolvedValueOnce(mockQuestion);

            const response = await request(app)
                .put(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: 'Updated Title',
                    content: 'Updated Content',
                    tags: ['67289ce5fed4ea2d6963afb7']
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(403);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Not authorized'),
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const mockQuestionId = '68ee68e62869fd5ce11a7c78';
            const mockQuestion = {
                _id: mockQuestionId,
                title: 'Old Title',
                content: 'Old Content',
                tags: ['67289ce5fed4ea2d6963afb7'],
                creator: '68ecfe5f977174350fab2a37',
                save: jest.fn(),
            };

            jest.spyOn(Question, 'findById').mockResolvedValueOnce(mockQuestion);

            const response = await request(app)
                .put(`/questions/${mockQuestionId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    title: '',
                    content: '',
                    tags: []
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Validation failed')
                })
            );
        });

    });

});
