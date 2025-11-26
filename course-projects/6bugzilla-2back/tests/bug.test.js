const request = require('supertest');
const app = require('./testUtils');
const Bug = require('../models/bug.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {mongoConnect, closeConnection} = require('../util/database');

describe('Bug Controller', () => {
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
                },
            },
            {upsert: true}
        );

        const loginResponse = await request(app)
            .post('/auth/login')
            .send({email: 'admin1@test.com', password: '123456'})
            .set('Content-Type', 'application/json');

        expect(loginResponse.status).toBe(200);
        validToken = loginResponse.body.token;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await closeConnection();
    });

    describe('GET /bugs', () => {
        it('should return 200 and a list of bugs with total', async () => {
            const sampleBug = {
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
                comments: [],
                history: [],
                _id: '692483ab259bde177f30ab0b',
                createdAt: '2025-11-24T16:11:23.780Z',
                updatedAt: '2025-11-24T16:11:23.780Z',
                __v: 0
            };

            let findCall = 0;
            jest.spyOn(Bug, 'find').mockImplementation(() => {
                findCall += 1;
                if (findCall === 1) {
                    return {countDocuments: () => Promise.resolve(1)};
                }
                const query = {
                    populate() {
                        return query;
                    },
                    skip() {
                        return query;
                    },
                    limit() {
                        return Promise.resolve([sampleBug]);
                    }
                };
                return query;
            });

            const res = await request(app)
                .get('/bugs')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Bugs fetched successfully',
                    bugs: expect.arrayContaining([expect.objectContaining({
                        _id: sampleBug._id,
                        summary: sampleBug.summary
                    })]),
                    total: 1
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(Bug, 'find').mockImplementationOnce(() => ({
                countDocuments: () => Promise.reject(new Error('Database error')),
            }));

            const res = await request(app)
                .get('/bugs')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(expect.objectContaining({message: 'Database error'}));
        });
    });

    {
        describe('GET /bugs/:bugId', () => {
            it('should return 200 and the bug details if found', async () => {
                const sampleBug = {
                    _id: '692483ab259bde177f30ab0b',
                    product: {
                        _id: '69208fd36fb0905085f395d5',
                        classification: '691dda59a581743f76150b0e',
                        name: 'Product 1',
                        description: 'This is the content of the first product',
                        version: 1,
                        components: ['69247d9aad0e1c26b84eca02'],
                        createdAt: '2025-11-21T16:14:11.629Z',
                        updatedAt: '2025-11-24T15:45:30.192Z',
                        __v: 1
                    },
                    component: {
                        _id: '69247d9aad0e1c26b84eca02',
                        product: '69208fd36fb0905085f395d5',
                        name: 'Component 1',
                        description: 'This is the content of the first component',
                        assignee: '691c7d023d5b3fbd8397b1fe',
                        CC: ['691c7d023d5b3fbd8397b1fe'],
                        bugs: ['692483ab259bde177f30ab0b'],
                        createdAt: '2025-11-24T15:45:30.123Z',
                        updatedAt: '2025-11-24T16:11:23.857Z',
                        __v: 1
                    },
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
                    assignee: {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        password: '$2a$12$6ufBBxQByVey8H4CWfRu8OqoQc3gQbE7Rgav7ARuFNYqUQ0hW1Kaq',
                        name: 'User Test 1',
                        bugsAssigned: ['692483ab259bde177f30ab0b'],
                        reportedBugs: ['692483ab259bde177f30ab0b'],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-24T16:14:56.629Z',
                        __v: 2
                    },
                    reporter: {
                        _id: '691c7d023d5b3fbd8397b1fe',
                        email: 'admin1@test.com',
                        password: '$2a$12$6ufBBxQByVey8H4CWfRu8OqoQc3gQbE7Rgav7ARuFNYqUQ0hW1Kaq',
                        name: 'User Test 1',
                        bugsAssigned: ['692483ab259bde177f30ab0b'],
                        reportedBugs: ['692483ab259bde177f30ab0b'],
                        isAdmin: true,
                        createdAt: '2025-11-18T14:04:50.796Z',
                        updatedAt: '2025-11-24T16:14:56.629Z',
                        __v: 2
                    },
                    deadline: '2023-12-31T23:59:59.000Z',
                    hoursWorked: 0,
                    hoursLeft: 10,
                    dependencies: [],
                    attachment: 'images/2025-11-24T16-11-23.769Z-book-1296045.png',
                    comments: [],
                    history: [],
                    createdAt: '2025-11-24T16:11:23.780Z',
                    updatedAt: '2025-11-24T16:11:23.780Z',
                    __v: 0
                };

                // mock findById to return a chainable query whose populate() returns same query and then() resolves to sampleBug
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() {
                            return q;
                        },
                        then(cb) {
                            return Promise.resolve(sampleBug).then(cb);
                        }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${sampleBug._id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Bug fetched successfully',
                        bug: expect.objectContaining({
                            _id: sampleBug._id,
                            summary: sampleBug.summary,
                            product: expect.objectContaining({_id: sampleBug.product._id}),
                            component: expect.objectContaining({_id: sampleBug.component._id}),
                            assignee: expect.objectContaining({_id: sampleBug.assignee._id}),
                            reporter: expect.objectContaining({_id: sampleBug.reporter._id})
                        })
                    })
                );
            });

            it('should return 404 if bug not found', async () => {
                const id = '000000000000000000000000';
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() {
                            return q;
                        },
                        then(cb) {
                            return Promise.resolve(null).then(cb);
                        }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(404);
                expect(res.body).toEqual(expect.objectContaining({message: expect.stringContaining('Bug not found')}));
            });

            it('should handle errors and return 500', async () => {
                const id = '692483ab259bde177f30ab0b';
                jest.spyOn(Bug, 'findById').mockImplementationOnce(() => {
                    const q = {
                        populate() {
                            return q;
                        },
                        then() {
                            return Promise.reject(new Error('Database error'));
                        }
                    };
                    return q;
                });

                const res = await request(app)
                    .get(`/bugs/${id}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(expect.objectContaining({message: 'Database error'}));
            });
        });

        describe('POST /bugs (CREATE Bug)', () => {
            it('should create a bug and return 201 with details', async () => {
                const productId = '69208fd36fb0905085f395d5';
                const componentId = '69247d9aad0e1c26b84eca02';
                const assigneeId = '691c7d023d5b3fbd8397b1fe';
                const reporterId = '691c7d023d5b3fbd8397b1fe';

                const savedBug = {
                    _id: '692483ab259bde177f30ab0b',
                    product: productId,
                    component: componentId,
                    summary: 'Bug summary',
                    description: 'Detailed description of the bug',
                    severity: 'Normal',
                    priority: 'Low',
                    version: 1,
                    hardware: 'PC',
                    os: 'Windows',
                    status: 'Open',
                    resolution: '',
                    CC: [assigneeId],
                    assignee: assigneeId,
                    reporter: reporterId,
                    deadline: '2023-12-31T23:59:59.000Z',
                    hoursWorked: 0,
                    hoursLeft: 10,
                    dependencies: [],
                    attachment: 'images/2025-11-24T16-11-23.769Z-book-1296045.png'
                };

                jest.spyOn(require('../models/bug.model').prototype, 'save').mockResolvedValueOnce(savedBug);

                jest.spyOn(require('../models/component.model'), 'findById').mockResolvedValueOnce({
                    _id: componentId,
                    bugs: [],
                    save: jest.fn().mockResolvedValueOnce({})
                });

                jest.spyOn(require('../models/user.model'), 'findById')
                    .mockResolvedValueOnce({
                        _id: assigneeId,
                        email: 'admin1@test.com',
                        bugsAssigned: [],
                        save: jest.fn().mockResolvedValueOnce({})
                    })
                    .mockResolvedValueOnce({
                        _id: reporterId,
                        email: 'admin1@test.com',
                        reportedBugs: [],
                        save: jest.fn().mockResolvedValueOnce({})
                    });

                jest.spyOn(require('../models/user.model'), 'find').mockResolvedValueOnce([{email: 'cc@test.com'}]);

                const res = await request(app)
                    .post('/bugs')
                    .set('Authorization', `Bearer ${validToken}`)
                    .field('product', productId)
                    .field('component', componentId)
                    .field('summary', 'Bug summary')
                    .field('description', 'Detailed description of the bug')
                    .field('severity', 'Normal')
                    .field('priority', 'Low')
                    .field('version', '1.0')
                    .field('hardware', 'PC')
                    .field('os', 'Windows')
                    .field('status', 'Open')
                    .field('cc[]', assigneeId)
                    .field('assignee', assigneeId)
                    .field('deadline', '2023-12-31T23:59:59Z')
                    .field('hoursWorked', '0')
                    .field('hoursLeft', '10')
                    .attach('attachment', Buffer.from('fake'), 'book-1296045.png');

                expect(res.status).toBe(201);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Bug created successfully',
                        bug: expect.objectContaining({
                            summary: 'Bug summary',
                            product: productId,
                            component: componentId,
                            assignee: assigneeId
                        })
                    })
                );
            });

            it('should return 422 if validation fails (missing required fields)', async () => {
                const res = await request(app)
                    .post('/bugs')
                    .set('Authorization', `Bearer ${validToken}`)
                    // send empty multipart (no summary/component/product)
                    .field('summary', '')
                    .field('description', '')
                    .attach('attachment', Buffer.from('fake'), 'book-1296045.png');

                expect(res.status).toBe(422);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('Validation failed')
                    })
                );
            });

            it('should return 500 if there is a server error during creation', async () => {
                // make save reject
                jest.spyOn(require('../models/bug.model').prototype, 'save').mockRejectedValueOnce(new Error('Database error during save'));

                const res = await request(app)
                    .post('/bugs')
                    .set('Authorization', `Bearer ${validToken}`)
                    .field('product', '69208fd36fb0905085f395d5')
                    .field('component', '69247d9aad0e1c26b84eca02')
                    .field('summary', 'Bug summary')
                    .field('description', 'Detailed description of the bug')
                    .attach('attachment', Buffer.from('fake'), 'book-1296045.png');

                expect(res.status).toBe(500);
                expect(res.body).toEqual(expect.objectContaining({message: 'Database error during save'}));
            });
        });

        describe('PUT /bugs/:bugId (UPDATE Bug)', () => {
            it('should update a bug and return 201 with message', async () => {
                const bugId = '692483ab259bde177f30ab0b';
                const existingBug = {
                    _id: bugId,
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
                    deadline: new Date('2023-12-31T23:59:59Z'),
                    hoursWorked: 0,
                    hoursLeft: 10,
                    dependencies: [],
                    attachment: 'images/old.png',
                    comments: [],
                    history: [],
                    save: jest.fn().mockResolvedValueOnce(true)
                };

                jest.spyOn(Bug, 'findById').mockResolvedValueOnce(existingBug);

                const bugController = require('../controllers/bug.controller');
                jest.spyOn(bugController, 'logBugChange').mockResolvedValueOnce();

                const UserModel = require('../models/user.model');
                jest.spyOn(UserModel, 'find').mockResolvedValueOnce([]);

                const res = await request(app)
                    .put(`/bugs/${bugId}`)
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({
                        summary: 'Updated summary',
                        description: 'Updated detailed description',
                        image: 'images/new.png'
                    })
                    .set('Content-Type', 'application/json');

                expect(Bug.findById).toHaveBeenCalledWith(bugId);
                expect(existingBug.save).toHaveBeenCalled();
                expect(bugController.logBugChange).toHaveBeenCalled();
                expect(res.status).toBe(201);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Bug updated successfully'
                    })
                );
            });

            it('should return 404 if the bug is not found', async () => {
                const bugId = '000000000000000000000000';
                jest.spyOn(Bug, 'findById').mockResolvedValueOnce(null);

                const res = await request(app)
                    .put(`/bugs/${bugId}`)
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({image: 'images/new.png', summary: 'x'})
                    .set('Content-Type', 'application/json');

                expect(Bug.findById).toHaveBeenCalledWith(bugId);
                expect(res.status).toBe(404);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: expect.stringContaining('Bug not found')
                    })
                );
            });

            /* it('should return 422 if no file/image is provided', async () => {
                 const bugId = '692483ab259bde177f30ab0b';

                 const res = await request(app)
                     .put(`/bugs/${bugId}`)
                     .set('Authorization', `Bearer ${validToken}`)
                     .send({ summary: 'Updated summary' })
                     .set('Content-Type', 'application/json');

                 expect(res.status).toBe(422);
                 expect(res.body).toEqual(
                     expect.objectContaining({
                         message: expect.stringMatching(/no (file|image) picked|no image provided/i)
                     })
                 );
             });*/

            it('should return 500 if there is a server error', async () => {
                const bugId = '692483ab259bde177f30ab0b';
                jest.spyOn(Bug, 'findById').mockRejectedValueOnce(new Error('Database error'));

                const res = await request(app)
                    .put(`/bugs/${bugId}`)
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({image: 'images/new.png', summary: 'Updated summary'})
                    .set('Content-Type', 'application/json');

                expect(res.status).toBe(500);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Database error'
                    })
                );
            });
        });

        describe('DELETE /bugs/:bugId (DELETE Bug)', () => {
            let componentDoc;
            let createdBugId;

            beforeAll(async () => {
                const Component = require('../models/component.model');
                componentDoc = await Component.create({
                    product: '69208fd36fb0905085f395d5',
                    name: 'Test Component For Delete',
                    description: 'Component for delete tests',
                    assignee: '691c7d023d5b3fbd8397b1fe',
                    CC: [],
                    bugs: []
                });

                const bug = await Bug.create({
                    product: '69208fd36fb0905085f395d5',
                    component: componentDoc._id,
                    summary: 'Bug to be deleted',
                    description: 'Created by test for deletion',
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
                    deadline: new Date('2023-12-31T23:59:59Z'),
                    hoursWorked: 0,
                    hoursLeft: 10,
                    dependencies: [],
                    attachment: 'images/test-delete.png',
                    comments: [],
                    history: []
                });

                createdBugId = bug._id.toString();

                componentDoc.bugs.push(createdBugId);
                await componentDoc.save();
            });

            afterAll(async () => {
                const Component = require('../models/component.model');
                if (componentDoc && componentDoc._id) {
                    await Component.findByIdAndDelete(componentDoc._id).catch(() => {});
                }
            });

            it('should return 404 if the bug does not exist', async () => {
                const nonExistentId = '000000000000000000000000';
                jest.spyOn(Bug, 'findByIdAndDelete').mockResolvedValueOnce(null);

                const res = await request(app)
                    .delete(`/bugs/${nonExistentId}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(404);
                expect(res.body).toEqual(expect.objectContaining({
                    message: expect.stringContaining('Bug not found')
                }));
            });

            it('should handle errors and return 500', async () => {
                // mock a DB error for this single call (won't delete the real bug)
                jest.spyOn(Bug, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));

                const res = await request(app)
                    .delete(`/bugs/${createdBugId}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(expect.objectContaining({
                    message: 'Database error'
                }));
            });

            it('should delete a bug successfully with a valid bug ID', async () => {
                const res = await request(app)
                    .delete(`/bugs/${createdBugId}`)
                    .set('Authorization', `Bearer ${validToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Bug deleted successfully'
                    })
                );

                // verify component no longer references the bug
                const Component = require('../models/component.model');
                const freshComponent = await Component.findById(componentDoc._id);
                expect(freshComponent).toBeTruthy();
                expect(Array.isArray(freshComponent.bugs)).toBe(true);
                expect(freshComponent.bugs.map(b => b.toString())).not.toContain(createdBugId);
            });
        });
    }
});

