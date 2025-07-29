const request = require('supertest');
const app = require('../app'); // Ensure app.js exports the Express app
const Product = require('../models/product.model');
const mongoose = require('mongoose');

jest.mock('../models/product.model');

describe('Product Controller', () => {
    let authToken;

    beforeAll(async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin1@test.com', password: '123456' });
        authToken = response.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /products', () => {
        it('should fetch a list of products', async () => {
            const mockFind = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ name: 'Test Product', price: 10 }]),
            };
            Product.find.mockReturnValue(mockFind);
            Product.find().countDocuments = jest.fn().mockResolvedValue(1);

            const response = await request(app)
                .get('/products?page=1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Products fetched successfully');
            expect(response.body.products).toHaveLength(1);
        });
    });

    describe('POST /products', () => {
        it('should create a new product', async () => {
            Product.prototype.save = jest.fn().mockResolvedValue({
                name: 'New Product',
                price: 9.99,
                description: 'Test description',
                imageUrl: 'test/image/path',
            });

            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${authToken}`)
                .field('name', 'New Product')
                .field('price', 9.99)
                .field('description', 'Test description')
                .attach('image', '__tests__/test-image.png');

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Product created successfully');
            expect(response.body.product.name).toBe('New Product');
        });
    });

    describe('GET /products/:productId', () => {
        it('should fetch a product by ID', async () => {
            Product.findById.mockResolvedValue({
                name: 'Test Product',
                price: 10,
                description: 'Test description',
            });

            const response = await request(app)
                .get('/products/validProductId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product fetched successfully');
            expect(response.body.product.name).toBe('Test Product');
        });

        it('should return 404 if product is not found', async () => {
            Product.findById.mockResolvedValue(null);

            const response = await request(app)
                .get('/products/invalidProductId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Could not find the post with id:invalidProductId');
        });
    });

    describe('PUT /products/:productId', () => {
        it('should update a product', async () => {
            Product.findById.mockResolvedValue({
                name: 'Old Product',
                price: 10,
                description: 'Old description',
                imageUrl: 'old/image/path',
                creator: 'userId',
                save: jest.fn().mockResolvedValue({
                    name: 'Updated Product',
                    price: 19.99,
                    description: 'Updated description',
                    imageUrl: 'new/image/path',
                }),
            });

            const response = await request(app)
                .put('/products/validProductId')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Product',
                    price: 19.99,
                    description: 'Updated description',
                    image: 'new/image/path',
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product updated successfully');
            expect(response.body.product.name).toBe('Updated Product');
        });
    });

    describe('DELETE /products/:productId', () => {
        it('should delete a product', async () => {
            Product.findById.mockResolvedValue({
                name: 'Test Product',
                price: 10,
                description: 'Test description',
                imageUrl: 'test/image/path',
                creator: 'userId',
            });
            Product.findByIdAndDelete.mockResolvedValue();

            const response = await request(app)
                .delete('/products/validProductId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product deleted successfully');
        });
    });
});