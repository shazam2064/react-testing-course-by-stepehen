const request = require('supertest');
const app= require('./testUtils');
const Product = require('../models/product.model');
const path = require('path');

describe('Product Controller', () => {
    describe('Product Controller - GET Products', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should return 200 and a list of products with total items', async () => {
            const mockProducts = [
                {
                    _id: '688cdc39cf05275731d730ff',
                    name: 'New product with image - 2025-08-01T15:24:40.989839Z',
                    price: 9.99,
                    description: 'This is the description of the new product',
                    imageUrl: 'images/2025-08-01T15-24-41.014Z-book-1296045.png',
                    creator: '688ccf9a0ab0514c3e06390f',
                    createdAt: '2025-08-01T15:24:41.022Z',
                    updatedAt: '2025-08-01T15:24:41.022Z',
                    __v: 0,
                },
            ];

            jest.spyOn(Product, 'find').mockReturnValueOnce(mockProducts);

            const response = await request(app)
                .get('/products')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Products fetched successfully',
                    products: expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.any(String),
                            name: expect.any(String),
                            price: expect.any(Number),
                            description: expect.any(String),
                            imageUrl: expect.any(String),
                        }),
                    ]),
                })
            );
        });

        it('should return 401 if Authorization header is missing', async () => {
            const response = await request(app).get('/products');

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Not authenticated.',
                })
            );
        });
    });

    describe('Product Controller - Get Product By ID', () => {
        let validToken;

        beforeAll(async () => {
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

        it('should return 200 and the product if a valid productId is provided', async () => {
            const mockProduct = {
                _id: '688cdc39cf05275731d730ff',
                name: 'Test Product',
                price: 9.99,
                description: 'Test description',
                imageUrl: 'images/test.png',
                creator: '688ccf9a0ab0514c3e06390f',
                createdAt: '2025-08-01T15:24:41.022Z',
                updatedAt: '2025-08-01T15:24:41.022Z',
            };

            jest.spyOn(Product, 'findById').mockResolvedValueOnce(mockProduct);

            const response = await request(app)
                .get(`/products/${mockProduct._id}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Product fetched successfully',
                    product: mockProduct,
                })
            );
        });

        it('should return 404 if the product is not found', async () => {
            const nonExistentProductId = '000000000000000000000000';

            jest.spyOn(Product, 'findById').mockResolvedValueOnce(null);

            const response = await request(app)
                .get(`/products/${nonExistentProductId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: `Could not find the post with id:${nonExistentProductId}`,
                })
            );
        });

        it('should return 500 if there is a database error', async () => {
            const mockProductId = '688cdc39cf05275731d730ff';

            jest.spyOn(Product, 'findById').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get(`/products/${mockProductId}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });
    });


    describe('Product Controller - Create Product', () => {
        let authToken;
        let createdProductId;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin1@test.com',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.body.token;
        });

        it('should create a product successfully with valid data and image', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Test Product')
                .field('price', '9.99')
                .field('description', 'This is a test product')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));

            expect(response.status).toBe(201);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Product created successfully',
                    product: expect.objectContaining({
                        name: 'Test Product',
                        price: 9.99,
                        description: 'This is a test product',
                        imageUrl: expect.any(String),
                    }),
                })
            );

            createdProductId = response.body.product._id;
        });

        it('should return 422 if no image is provided', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Test Product')
                .field('price', '9.99')
                .field('description', 'This is a test product');

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'No image provided',
                })
            );
        });

        it('should return 422 if validation fails (e.g., missing name)', async () => {
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('price', '9.99')
                .field('description', 'This is a test product')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));

            expect(response.status).toBe(422);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Validation failed, entered data is incorrect',
                })
            );
        });

        it('should return 401 if no authorization token is provided', async () => {
            const response = await request(app)
                .post('/products')
                .field('name', 'Test Product')
                .field('price', '9.99')
                .field('description', 'This is a test product')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));

            expect(response.status).toBe(401);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Not authenticated.',
                })
            );
        });
        afterAll(async () => {
            if (createdProductId) {
                const deleteResponse = await request(app)
                    .delete(`/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${authToken}`);

                expect(deleteResponse.status).toBe(200);
                expect(deleteResponse.body).toEqual(
                    expect.objectContaining({
                        message: 'Product deleted successfully',
                    })
                );
            }
        });
    });


    describe('Product Controller - Update Product', () => {
        let authToken;
        let createdProductId;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin1@test.com',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.body.token;

            const createResponse = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Test Product')
                .field('price', '9.99')
                .field('description', 'This is a test product')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));
            expect(createResponse.status).toBe(201);
            createdProductId = createResponse.body.product._id;
        });

        it('should update a product successfully with valid data and image', async () => {
            const updateResponse = await request(app)
                .put(`/products/${createdProductId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Updated Product')
                .field('price', '19.99')
                .field('description', 'This is the updated description')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Product updated successfully',
                    product: expect.objectContaining({
                        name: 'Updated Product',
                        price: 19.99,
                        description: 'This is the updated description',
                        imageUrl: expect.any(String),
                    }),
                })
            );
        });

        it('should return 422 if no image is provided during update', async () => {
            const updateResponse = await request(app)
                .put(`/products/${createdProductId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Updated Product Without Image')
                .field('price', '19.99')
                .field('description', 'This is the updated description without image');

            expect(updateResponse.status).toBe(422);
            expect(updateResponse.body).toEqual(
                expect.objectContaining({
                    message: 'No file picked',
                })
            );
        });

        it('should return 404 if the product does not exist', async () => {
            const updateResponse = await request(app)
                .put('/products/123456789012345678901234')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Nonexistent Product')
                .field('price', '19.99')
                .field('description', 'This product does not exist')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));

            expect(updateResponse.status).toBe(404);
            expect(updateResponse.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Could not find the post with id:'),
                })
            );
        });

        afterAll(async () => {
            if (createdProductId) {
                const deleteResponse = await request(app)
                    .delete(`/products/${createdProductId}`)
                    .set('Authorization', `Bearer ${authToken}`);
                expect(deleteResponse.status).toBe(200);
                expect(deleteResponse.body).toEqual(
                    expect.objectContaining({
                        message: 'Product deleted successfully',
                    })
                );
            }
        });
    });

    describe('Product Controller - Delete Product', () => {
        let authToken;
        let createdProductId;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin1@test.com',
                    password: '123456',
                })
                .set('Content-Type', 'application/json');
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.body.token;

            const createResponse = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'Test Product for Deletion')
                .field('price', '9.99')
                .field('description', 'This product will be deleted')
                .attach('image', path.join(__dirname, '../images/book-1296045.png'));
            expect(createResponse.status).toBe(201);
            createdProductId = createResponse.body.product._id;
        });

        it('should return 404 if the product does not exist', async () => {
            const nonExistentProductId = '000000000000000000000000';

            const response = await request(app)
                .delete(`/products/${nonExistentProductId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Could not find the post with id:'),
                })
            );
        });

        it('should handle errors and return 500 on server error', async () => {
            jest.spyOn(Product, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete(`/products/${createdProductId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual(
                expect.objectContaining({
                    message: 'Database error',
                })
            );
        });

        it('should delete a product successfully with a valid product ID', async () => {
            const deleteResponse = await request(app)
                .delete(`/products/${createdProductId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toEqual(
                expect.objectContaining({
                    message: 'Product deleted successfully',
                })
            );
        });
    });

    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});
