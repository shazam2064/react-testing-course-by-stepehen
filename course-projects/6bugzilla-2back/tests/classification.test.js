const request = require('supertest');
const app = require('./testUtils');
const Classification = require('../models/classification.model');

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

        // first find() -> countDocuments()
        jest.spyOn(Classification, 'find')
            .mockImplementationOnce(() => ({
                countDocuments: () => Promise.resolve(mockTotal)
            }))
            // second find() -> populate().skip().limit() -> classifications
            .mockImplementationOnce(() => ({
                populate: () => ({
                    skip: () => ({
                        limit: () => Promise.resolve(mockClassifications)
                    })
                })
            }));

        const res = await request(app)
            .get('/classifications')
            .set('Content-Type', 'application/json');

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
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(500);
        expect(res.body).toEqual(
            expect.objectContaining({
                message: expect.any(String)
            })
        );
    });
});

