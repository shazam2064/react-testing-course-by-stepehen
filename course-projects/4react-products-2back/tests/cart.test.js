const request = require('supertest');
const path = require('path');
const app = require('./testUtils');

describe('Cart Controller - Add and Remove Product', () => {
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

        const productResponse = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Test Product for Cart')
            .field('price', '9.99')
            .field('description', 'This product is for cart testing')
            .attach('image', path.join(__dirname, '../images/book-1296045.png'));
        expect(productResponse.status).toBe(201);
        createdProductId = productResponse.body.product._id;
    });

    it('should add a product to the cart', async () => {
        const response = await request(app)
            .post('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                productId: createdProductId,
                quantity: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Product added to cart successfully');
        expect(response.body.cart.products).toHaveLength(1);
        expect(response.body.cart.products[0].product).toBe(createdProductId);
    });

    it('should fetch the user\'s cart', async () => {
        const response = await request(app)
            .get('/cart')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cart fetched successfully');
        expect(response.body.cart.products).toHaveLength(1);
        expect(response.body.cart.products[0].product._id).toBe(createdProductId);
    });

    it('should remove a product from the cart', async () => {
        const response = await request(app)
            .delete(`/cart/${createdProductId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Product deleted from cart successfully');
        expect(response.body.cart.products).toHaveLength(0);
    });

    afterAll(async () => {
        if (createdProductId) {
            const deleteResponse = await request(app)
                .delete(`/products/${createdProductId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body.message).toBe('Product deleted successfully');
        }
    });
    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});