const request = require('supertest');
const app = require('./testUtils');
const Product = require('../models/product.model');
const Classification = require('../models/classification.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { mongoConnect, closeConnection } = require('../util/database');

describe('Product Controller', () => {
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
                },
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

    describe('Product Controller - GET Products', () => {
        it('should return 200 and a list of products', async () => {
            const mockProducts = [
                {
                    _id: '69208fd36fb0905085f395d5',
                    classification: '691dda59a581743f76150b0e',
                    name: 'Product 1',
                    description: 'This is the content of the first product',
                    version: 1,
                    components: [],
                    createdAt: '2025-11-21T16:14:11.629Z',
                    updatedAt: '2025-11-21T16:14:11.629Z',
                    __v: 0
                }
            ];

            // single mock for Product.find that handles both controller calls (countDocuments then populated query)
            let findCall = 0;
            jest.spyOn(Product, 'find').mockImplementation(() => {
                findCall += 1;
                if (findCall === 1) {
                    // first call: countDocuments()
                    return { countDocuments: () => Promise.resolve(mockProducts.length) };
                }
                // second call: return chainable query for populate().populate().skip().limit()
                return {
                    populate: () => ({
                        populate: () => ({
                            skip: () => ({
                                limit: () => Promise.resolve(mockProducts),
                            }),
                        }),
                    }),
                };
            });

            const res = await request(app)
                .get('/products')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Products fetched successfully',
                    products: expect.arrayContaining([
                        expect.objectContaining({
                            _id: mockProducts[0]._id,
                            name: 'Product 1',
                            description: expect.any(String),
                        }),
                    ]),
                    total: mockProducts.length,
                })
            );
        });

        it('should handle errors and return 500', async () => {
            jest.spyOn(Product, 'find').mockImplementation(() => {
                throw new Error('Database error');
            });

            const res = await request(app)
                .get('/products')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });

    describe('Product Controller - GET Product by ID', () => {
        it('should return 200 and the product details if the product exists', async () => {
            const mockProductId = '69208fd36fb0905085f395d5';
            const mockProduct = {
                _id: mockProductId,
                classification: { _id: '691dda59a581743f76150b0e', name: 'Classification 1' },
                name: 'Product 1',
                description: 'This is the content of the first product',
                version: 1,
                components: []
            };

            jest.spyOn(Product, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.resolve(mockProduct),
            }));

            const res = await request(app)
                .get(`/products/${mockProductId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Product fetched successfully',
                    product: expect.objectContaining({
                        _id: mockProductId,
                        name: 'Product 1',
                        description: expect.any(String),
                    }),
                })
            );
        });

        it('should return 404 if the product is not found', async () => {
            const mockProductId = '691000000000000000000000';
            jest.spyOn(Product, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.resolve(null),
            }));

            const res = await request(app)
                .get(`/products/${mockProductId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Product not found'),
                })
            );
        });

        it('should handle errors and return 500', async () => {
            const mockProductId = '69208fd36fb0905085f395d5';
            jest.spyOn(Product, 'findById').mockImplementationOnce(() => ({
                populate: () => Promise.reject(new Error('Database error')),
            }));

            const res = await request(app)
                .get(`/products/${mockProductId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });
});
