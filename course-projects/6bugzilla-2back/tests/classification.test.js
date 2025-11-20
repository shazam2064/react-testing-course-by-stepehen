jest.mock('../middleware/is-auth.middleware', () => (req, res, next) => {
    req.userId = '691c7d023d5b3fbd8397b1fe';
    req.isAdmin = true;
    return next();
});

const request = require('supertest');
const app = require('./testUtils');
const Classification = require('../models/classification.model');
const validator = require('express-validator');

describe('Classification Controller', () => {
    let authToken;

    beforeAll(async () => {
        authToken = 'TEST_DUMMY_TOKEN';
    });

    describe('Classification Controller - GET Classifications', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return 200 and a list of classifications', async () => {
            const mockTotal = 1;
            const mockClassifications = [
                {
                    name: 'Classification 1',
                    description: 'This is the content of the first classification',
                    products: [],
                    _id: '691dda59a581743f76150b0e',
                    createdAt: '2025-11-19T14:55:21.661Z',
                    updatedAt: '2025-11-19T14:55:21.661Z',
                    __v: 0
                }
            ];

            jest.spyOn(Classification, 'find')
                .mockImplementationOnce(() => ({
                    countDocuments: () => Promise.resolve(mockTotal)
                }))
                .mockImplementationOnce(() => ({
                    populate: () => ({
                        skip: () => ({
                            limit: () => Promise.resolve(mockClassifications)
                        })
                    })
                }));

            const res = await request(app)
                .get('/classifications')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Classifications fetched successfully',
                    classifications: expect.any(Array),
                    total: mockTotal
                })
            );
            expect(res.body.classifications).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: '691dda59a581743f76150b0e',
                    name: 'Classification 1'
                })
            ]));
        });

        it('should return 500 if there is a server error', async () => {
            jest.spyOn(Classification, 'find').mockImplementationOnce(() => ({
                countDocuments: () => Promise.reject(new Error('Database error'))
            }));

            const res = await request(app)
                .get('/classifications')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: expect.any(String)
                })
            );
        });

        describe('Classification Controller - GET Classification by ID', () => {
            const sample = {
                name: 'Classification 1',
                description: 'This is the content of the first classification',
                products: [],
                _id: '691dda59a581743f76150b0e',
                createdAt: '2025-11-19T14:55:21.661Z',
                updatedAt: '2025-11-19T14:55:21.661Z',
                __v: 0
            };

            it('should return 200 and the classification when found', async () => {
                jest.spyOn(Classification, 'findById').mockResolvedValueOnce(sample);

                const res = await request(app)
                    .get(`/classifications/${sample._id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Classification fetched successfully',
                        classification: expect.objectContaining({
                            _id: sample._id,
                            name: sample.name,
                            description: sample.description
                        })
                    })
                );
            });

            it('should return 404 if the classification is not found', async () => {
                jest.spyOn(Classification, 'findById').mockResolvedValueOnce(null);

                const res = await request(app)
                    .get('/classifications/610000000000000000000000')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(404);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Classification not found'
                    })
                );
            });

            it('should return 500 if there is a server error', async () => {
                jest.spyOn(Classification, 'findById').mockRejectedValueOnce(new Error('Database error'));

                const res = await request(app)
                    .get(`/classifications/${sample._id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Database error'
                    })
                );
            });
        });

        describe('Classification Controller - CREATE Classification', () => {
            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('should create a classification and return 201', async () => {
                const payload = {
                    name: 'Classification 1',
                    description: 'This is the content of the first classification'
                };
                const saved = {
                    ...payload,
                    products: [],
                    _id: '691dda59a581743f76150b0e',
                    createdAt: '2025-11-19T14:55:21.661Z',
                    updatedAt: '2025-11-19T14:55:21.661Z',
                    __v: 0
                };

                // mock instance save
                jest.spyOn(Classification.prototype, 'save').mockResolvedValueOnce(saved);

                const res = await request(app)
                    .post('/classifications')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(201);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Classification created successfully',
                        classification: expect.objectContaining({
                            _id: saved._id,
                            name: saved.name,
                            description: saved.description
                        })
                    })
                );
            });

            it('should return 422 if validation fails', async () => {
                const validator = require('express-validator');
                const origValidationResult = validator.validationResult;
                try {
                    // temporary override (avoids spyOn on non-configurable property)
                    validator.validationResult = () => ({
                        isEmpty: () => false,
                        array: () => [{ msg: 'Name required', param: 'name', location: 'body' }]
                    });

                    const res = await request(app)
                        .post('/classifications')
                        .send({ name: '' })
                        .set('Content-Type', 'application/json')
                        .set('Authorization', `Bearer ${authToken}`);

                    expect(res.status).toBe(422);
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            message: expect.any(String)
                        })
                    );
                } finally {
                    validator.validationResult = origValidationResult;
                }
            });

            it('should return 500 if there is a server error during save', async () => {
                const payload = {
                    name: 'Classification 1',
                    description: 'This is the content of the first classification'
                };

                jest.spyOn(Classification.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

                const res = await request(app)
                    .post('/classifications')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: expect.any(String)
                    })
                );
            });
        });

        describe('Classification Controller - UPDATE Classification', () => {
            afterEach(() => {
                jest.restoreAllMocks();
            });

            it('should update a classification and return 200 with updated details', async () => {
                const id = '691dda59a581743f76150b0e';
                const existing = {
                    _id: id,
                    name: 'Classification 1',
                    description: 'Old description',
                    products: [],
                    save: jest.fn().mockResolvedValueOnce({
                        _id: id,
                        name: 'Classification 1 Updated',
                        description: 'Updated description',
                        products: []
                    })
                };

                jest.spyOn(Classification, 'findById').mockResolvedValueOnce(existing);

                const res = await request(app)
                    .put(`/classifications/${id}`)
                    .send({ name: 'Classification 1 Updated', description: 'Updated description', products: [] })
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(200);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Classification updated successfully',
                        classification: expect.objectContaining({
                            _id: id,
                            name: 'Classification 1 Updated',
                            description: 'Updated description'
                        })
                    })
                );
            });

            it('should return 404 if the classification is not found', async () => {
                const id = '610000000000000000000000';
                jest.spyOn(Classification, 'findById').mockResolvedValueOnce(null);

                const res = await request(app)
                    .put(`/classifications/${id}`)
                    .send({ name: 'Does not matter', description: 'Nope', products: [] })
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(404);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: 'Classification not found'
                    })
                );
            });

            it('should return 422 if validation fails', async () => {
                const validator = require('express-validator');
                const origValidationResult = validator.validationResult;
                try {
                    validator.validationResult = () => ({
                        isEmpty: () => false,
                        array: () => [{ msg: 'Name required', param: 'name', location: 'body' }]
                    });

                    const id = '691dda59a581743f76150b0e';
                    const res = await request(app)
                        .put(`/classifications/${id}`)
                        .send({ name: '', description: '' })
                        .set('Content-Type', 'application/json')
                        .set('Authorization', `Bearer ${authToken}`);

                    expect(res.status).toBe(422);
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            message: expect.any(String)
                        })
                    );
                } finally {
                    validator.validationResult = origValidationResult;
                }
            });

            it('should return 500 on database error', async () => {
                const id = '691dda59a581743f76150b0e';
                jest.spyOn(Classification, 'findById').mockRejectedValueOnce(new Error('Database error'));

                const res = await request(app)
                    .put(`/classifications/${id}`)
                    .send({ name: 'Whatever', description: 'Whatever', products: [] })
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${authToken}`);

                expect(res.status).toBe(500);
                expect(res.body).toEqual(
                    expect.objectContaining({
                        message: expect.any(String)
                    })
                );
            });
        });

    });

});
