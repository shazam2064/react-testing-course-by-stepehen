const request = require('supertest');
const path = require('path');
const app = require('./testUtils');

describe('Cart Controller - Add and Remove Product', () => {
    let authToken;

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

    it('should add a product to the cart', async () => {
        const productResponse = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Test Product for Add')
            .field('price', '1.11')
            .field('description', 'This product is for add testing')
            .attach('image', path.join(__dirname, '../images/book-1296045.png'));
        expect(productResponse.status).toBe(201);
        const createdProductId = productResponse.body.product._id;

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

        const removeCartResponse = await request(app)
            .delete(`/cart/${createdProductId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(removeCartResponse.status).toBe(200);

        const deleteResponse = await request(app)
            .delete(`/products/${createdProductId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(deleteResponse.status).toBe(200);
    });

    it('should fetch the user\'s cart', async () => {
        const productResponse = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Test Product for Fetch')
            .field('price', '2.22')
            .field('description', 'This product is for fetch testing')
            .attach('image', path.join(__dirname, '../images/book-1296045.png'));
        expect(productResponse.status).toBe(201);
        const createdProductId2 = productResponse.body.product._id;

        await request(app)
            .post('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                productId: createdProductId2,
                quantity: 1,
            });

        const response = await request(app)
            .get('/cart')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cart fetched successfully');
        expect(response.body.cart.products).toHaveLength(1);
        expect(response.body.cart.products[0].product._id).toBe(createdProductId2);

        const removeCartResponse = await request(app)
            .delete(`/cart/${createdProductId2}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(removeCartResponse.status).toBe(200);

        const deleteResponse = await request(app)
            .delete(`/products/${createdProductId2}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(deleteResponse.status).toBe(200);
    });

    it('should remove a product from the cart', async () => {
        const productResponse = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${authToken}`)
            .field('name', 'Test Product for Remove')
            .field('price', '3.33')
            .field('description', 'This product is for remove testing')
            .attach('image', path.join(__dirname, '../images/book-1296045.png'));
        expect(productResponse.status).toBe(201);
        const createdProductId3 = productResponse.body.product._id;

        await request(app)
            .post('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                productId: createdProductId3,
                quantity: 1,
            });

        const response = await request(app)
            .delete(`/cart/${createdProductId3}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Product deleted from cart successfully');
        expect(response.body.cart.products).toHaveLength(0);

        // Cleanup: Delete product
        const deleteResponse = await request(app)
            .delete(`/products/${createdProductId3}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(deleteResponse.status).toBe(200);
    });

    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});