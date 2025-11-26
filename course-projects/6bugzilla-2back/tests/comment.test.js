const request = require('supertest');
const app = require('./testUtils');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Bug = require('../models/bug.model');
const bcrypt = require('bcryptjs');
const {mongoConnect, closeConnection} = require("../util/database");

describe('Comments Controller', () => {
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

    describe('Comment Controller - GET Comments', () => {
        it('should return 200 and a list of comments for a bug (populated bug object)', async () => {
            const mockBugId = '692483ab259bde177f30ab0b';

            // the provided complex comment + populated bug fixture
            const populatedBug = {
                _id: '692483ab259bde177f30ab0b',
                product: '69208fd36fb0905085f395d5',
                component: '69247d9aad0e1c26b84eca02',
                summary: 'Bug summary',
                description: 'Detailed description of the bug',
                severity: 'Normal',
                priority: 'Low',
                version: 1,
                hardware: 'PC',
                os: 'Windows',
                status: 'Open',
                resolution: '',
                CC: [],
                assignee: '691c7d023d5b3fbd8397b1fe',
                reporter: '691c7d023d5b3fbd8397b1fe',
                deadline: '2023-12-31T23:59:59.000Z',
                hoursWorked: 0,
                hoursLeft: 10,
                dependencies: [],
                attachment: 'images/2025-11-24T16-11-23.769Z-book-1296045.png',
                comments: ['69271aa2a96041c76125fbc9'],
                history: [],
                createdAt: '2025-11-24T16:11:23.780Z',
                updatedAt: '2025-11-26T15:20:02.627Z',
                __v: 3
            };

            const commentFixture = {
                _id: '69271aa2a96041c76125fbc9',
                bug: populatedBug,
                text: 'This is the content of the first comment',
                creator: '691c7d023d5b3fbd8397b1fe',
                createdAt: '2025-11-26T15:20:02.564Z',
                updatedAt: '2025-11-26T15:20:02.564Z',
                __v: 0
            };

            let call = 0;
            jest.spyOn(Comment, 'find').mockImplementation(() => {
                call++;
                if (call === 1) {
                    return { countDocuments: jest.fn().mockResolvedValue(1) };
                }
                return {
                    populate: jest.fn().mockReturnThis(),
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([commentFixture])
                };
            });

            const response = await request(app)
                .get(`/comments?bug=${mockBugId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Comments fetched successfully',
                    total: 1,
                    comments: expect.any(Array)
                })
            );

            const returned = response.body.comments[0];
            expect(returned).toMatchObject({
                _id: '69271aa2a96041c76125fbc9',
                text: 'This is the content of the first comment',
                creator: '691c7d023d5b3fbd8397b1fe'
            });
            // verify bug is populated as object with expected fields
            expect(returned.bug).toMatchObject({
                _id: '692483ab259bde177f30ab0b',
                summary: 'Bug summary',
                component: '69247d9aad0e1c26b84eca02',
                attachment: expect.stringContaining('images/')
            });
        });

        it('should handle errors and return 500', async () => {
            const mockBugId = '692483ab259bde177f30ab0b';
            jest.spyOn(Comment, 'find').mockImplementationOnce(() => {
                return { countDocuments: jest.fn().mockRejectedValue(new Error('Database error')) };
            });

            const response = await request(app)
                .get(`/comments?bug=${mockBugId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error'
                })
            );
        });
    });

    describe('Comment Controller - CREATE Comment', () => {
        it('should create a new comment and return 201 with details', async () => {
            const mockBugId = '692483ab259bde177f30ab0b';
            const mockComment = {
                _id: '69271aa2a96041c76125fbc9',
                bug: mockBugId,
                text: 'This is the content of the first comment',
                creator: '691c7d023d5b3fbd8397b1fe',
                createdAt: '2025-11-26T15:20:02.564Z',
                updatedAt: '2025-11-26T15:20:02.564Z',
                __v: 0
            };

            jest.spyOn(Comment.prototype, 'save').mockResolvedValueOnce(mockComment);

            jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                const bugDoc = {
                    _id: mockBugId,
                    comments: [],
                    CC: [],
                    save: jest.fn().mockResolvedValueOnce(true)
                };
                return {
                    populate: jest.fn().mockResolvedValueOnce(bugDoc)
                };
            });

            jest.spyOn(User, 'find').mockResolvedValueOnce([]);

            const response = await request(app)
                .post('/comments')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    bug: mockBugId,
                    text: 'This is the content of the first comment'
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Comment created successfully',
                    comment: expect.objectContaining({
                        text: mockComment.text,
                        bug: mockBugId,
                        creator: mockComment.creator
                    })
                })
            );
        });

        it('should return 422 for invalid input', async () => {
            const response = await request(app)
                .post('/comments')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    bug: '',
                    text: ''
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Validation failed')
                })
            );
        });

        it('should return 500 if there is a server error during save', async () => {
            const mockBugId = '692483ab259bde177f30ab0b';
            jest.spyOn(Comment.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/comments')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    bug: mockBugId,
                    text: 'This is the content of the first comment'
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
