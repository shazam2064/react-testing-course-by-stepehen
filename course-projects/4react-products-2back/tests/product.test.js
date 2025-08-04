const request = require('supertest');
const app = require('../app');
const Product = require('../models/product.model');

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