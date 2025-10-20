const request = require('supertest');
const app = require('./testUtils');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');
const bcrypt = require('bcryptjs');
const {mongoConnect, closeConnection} = require("../util/database");

describe('Tag Controller', () => {
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

    describe('Tag Controller - GET Tags', () => {
        it('should return 200 and a list of tags', async () => {
            const mockTags = [
                {
                    name: 'New Tag',
                    questions: [],
                    description: 'New Tag Description',
                    _id: '68f63f982eca3e875b58ad7b',
                    createdAt: '2025-10-20T13:56:40.621Z',
                    updatedAt: '2025-10-20T13:56:40.621Z',
                    __v: 0
                }
            ];

            jest.spyOn(Tag, 'find').mockResolvedValueOnce(mockTags);

            const response = await request(app)
                .get('/tags')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tags fetched successfully',
                    tags: expect.arrayContaining([
                        expect.objectContaining({
                            _id: '68f63f982eca3e875b58ad7b',
                            name: 'New Tag',
                            description: 'New Tag Description'
                        })
                    ])
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(Tag, 'find').mockImplementationOnce(() => Promise.reject(new Error('Database error')));

            const response = await request(app)
                .get('/tags')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('Tag Controller - CREATE Tag', () => {
        it('should create a tag and return 201 with details', async () => {
            const mockTag = {
                name: 'New Tag',
                description: 'New Tag Description',
                _id: '68f63f982eca3e875b58ad7b',
                createdAt: '2025-10-20T13:56:40.621Z',
                updatedAt: '2025-10-20T13:56:40.621Z',
                __v: 0,
                questions: []
            };

            jest.spyOn(Tag.prototype, 'save').mockResolvedValueOnce(mockTag);

            const response = await request(app)
                .post('/tags')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: 'New Tag',
                    description: 'New Tag Description'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tag created successfully',
                    tag: expect.objectContaining({
                        name: 'New Tag',
                        description: 'New Tag Description',
                        questions: expect.any(Array),
                        _id: expect.any(String)
                    })
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const response = await request(app)
                .post('/tags')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: '',
                    description: ''
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
            jest.spyOn(Tag.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/tags')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: 'New Tag',
                    description: 'New Tag Description'
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

    describe('Tag Controller - UPDATE Tag', () => {
        it('should update a tag and return 200 with updated details', async () => {
            const mockTagId = '68f63f982eca3e875b58ad7b';
            const mockTag = {
                _id: mockTagId,
                name: 'Old Tag',
                description: 'Old Description',
                questions: [],
                save: jest.fn().mockResolvedValueOnce({
                    _id: mockTagId,
                    name: 'Updated Tag',
                    description: 'Updated Description',
                    questions: []
                })
            };

            jest.spyOn(Tag, 'findById').mockResolvedValueOnce(mockTag);

            const response = await request(app)
                .put(`/tags/${mockTagId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: 'Updated Tag',
                    description: 'Updated Description'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Tag updated successfully',
                    tag: expect.objectContaining({
                        _id: mockTagId,
                        name: 'Updated Tag',
                        description: 'Updated Description',
                        questions: expect.any(Array)
                    })
                })
            );
        });

        it('should return 404 if the tag is not found', async () => {
            jest.spyOn(Tag, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .put('/tags/unknownid')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: 'Updated Tag',
                    description: 'Updated Description'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Could not find')
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const mockTagId = '68f63f982eca3e875b58ad7b';

            const response = await request(app)
                .put(`/tags/${mockTagId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: '',
                    description: ''
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
            const mockTagId = '68f63f982eca3e875b58ad7b';
            jest.spyOn(Tag, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put(`/tags/${mockTagId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    name: 'Updated Tag',
                    description: 'Updated Description'
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
