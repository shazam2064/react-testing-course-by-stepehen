const request = require('supertest');
const app = require('../app'); // Adjust the path to your app entry point
const Order = require('../models/order.model');

describe('Order Controller - Get User Orders', () => {
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

        await Order.create({
            creator: loginResponse.body.userId,
            orderList: [
                {
                    productItem: '688cdc39cf05275731d730ff',
                    quantity: 1,
                },
            ],
        });
    });

    it('should fetch all user orders successfully', async () => {
        const response = await request(app)
            .get('/orders')
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Orders fetched successfully');
        expect(response.body.orders).toBeDefined();
        expect(response.body.orders.length).toBeGreaterThan(0);
    });

    it('should return error if an invalid token is provided', async () => {
        const response = await request(app)
            .get('/orders')
            .set('Authorization', 'Bearer invalidToken');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Token was not valid.');
    });

    afterAll(async () => {
        await Order.deleteMany({ creator: '688ccf9a0ab0514c3e06390f' });
    });
});

describe('Order Controller - Get Order By ID', () => {
    let authToken;
    let createdOrderId;

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

        const order = await Order.create({
            creator: loginResponse.body.userId,
            orderList: [
                {
                    productItem: '688cdc39cf05275731d730ff',
                    quantity: 1,
                },
            ],
        });
        createdOrderId = order._id.toString();
    });

    it('should fetch an order by ID successfully', async () => {
        const response = await request(app)
            .get(`/orders/${createdOrderId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Order fetched successfully');
        expect(response.body.order).toBeDefined();
        expect(response.body.order._id).toBe(createdOrderId);
    });

    it('should return 404 if the order does not exist', async () => {
        const nonExistentOrderId = '000000000000000000000000';
        const response = await request(app)
            .get(`/orders/${nonExistentOrderId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Order not found');
    });

    it('should return error for an invalid order ID format', async () => {
        const invalidOrderId = 'invalidOrderId';
        const response = await request(app)
            .get(`/orders/${invalidOrderId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Cast to ObjectId failed for value "invalidOrderId" (type string) at path \"_id\" for model \"Order\"');
    });

    afterAll(async () => {
        if (createdOrderId) {
            await Order.findByIdAndDelete(createdOrderId);
        }
    });
});