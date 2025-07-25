const request = require('supertest');
const app = require('../app');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

jest.mock('../models/cart.model');
jest.mock('../models/product.model');

describe('Cart Controller', () => {
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

    describe('GET /cart', () => {
        it('should fetch the user\'s cart', async () => {
            Cart.findOne.mockResolvedValue({
                user: 'userId',
                products: [{ product: { name: 'Test Product' }, quantity: 1 }],
            });

            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cart fetched successfully');
            expect(response.body.cart).toBeDefined();
        });

        it('should return 404 if cart is not found', async () => {
            Cart.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cart not found');
        });
    });

    describe('POST /cart', () => {
        it('should add a product to the cart', async () => {
            Product.findById.mockResolvedValue({ _id: 'productId', name: 'Test Product' });
            Cart.findOne.mockResolvedValue({
                user: 'userId',
                products: [],
                save: jest.fn().mockResolvedValue({
                    user: 'userId',
                    products: [{ product: 'productId', quantity: 1 }],
                }),
            });

            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: 'productId', quantity: 1 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Product added to cart successfully');
            expect(response.body.cart.products).toHaveLength(1);
        });

        it('should return 404 if product is not found', async () => {
            Product.findById.mockResolvedValue(null);

            const response = await request(app)
                .post('/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: 'invalidProductId', quantity: 1 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Product not found');
        });
    });

    describe('DELETE /cart/:productId', () => {
        it('should delete a product from the cart', async () => {
            Cart.findOne.mockResolvedValue({
                user: 'userId',
                products: [{ product: 'productId', quantity: 1 }],
                save: jest.fn().mockResolvedValue({
                    user: 'userId',
                    products: [],
                }),
            });

            const response = await request(app)
                .delete('/cart/productId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product deleted from cart successfully');
            expect(response.body.cart.products).toHaveLength(0);
        });

        it('should return 404 if product is not found in the cart', async () => {
            Cart.findOne.mockResolvedValue({
                user: 'userId',
                products: [],
            });

            const response = await request(app)
                .delete('/cart/invalidProductId')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Product not found in cart');
        });
    });
});