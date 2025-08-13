const request = require('supertest');
const app = require('../app');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const {closeConnection} = require("../util/database");


describe('Order Controller', () => {
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
            await Order.deleteMany({creator: '688ccf9a0ab0514c3e06390f'})
            await Cart.deleteMany({});
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
            await Cart.deleteMany({});
        });
    });


    describe('Order Controller - Create Order', () => {
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

            await Cart.create({
                user: loginResponse.body.userId,
                products: [
                    {
                        product: '688cdc39cf05275731d730ff',
                        quantity: 1,
                    },
                ],
            });
        });

        it('should create an order successfully', async () => {
            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Order created successfully');
            expect(response.body.order).toBeDefined();
            expect(response.body.order.orderList.length).toBeGreaterThan(0);
        });

        it('should return 400 if the cart is empty', async () => {
            await Cart.create({
                user: '688ccf9a0ab0514c3e06390f',
                products: [],
            });

            const response = await request(app)
                .post('/orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cart is empty');
        });

        afterAll(async () => {
            if (createdOrderId) {
                await Order.findByIdAndDelete(createdOrderId);
            }
            await Cart.deleteMany({});
        });
    });


    describe('Order Controller - Delete Order', () => {
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

        it('should delete an order successfully', async () => {
            const response = await request(app)
                .delete(`/orders/${createdOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Order deleted successfully');

            const deletedOrder = await Order.findById(createdOrderId);
            expect(deletedOrder).toBeNull();
        });

        it('should return 404 if the order does not exist', async () => {
            const nonExistentOrderId = '000000000000000000000000'; // Invalid MongoDB ObjectId
            const response = await request(app)
                .delete(`/orders/${nonExistentOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Order not found');
        });

        it('should return 403 if the user is not authorized to delete the order', async () => {
            const otherOrder = await Order.create({
                creator: '000000000000000000000000',
                orderList: [
                    {
                        productItem: '688cdc39cf05275731d730ff',
                        quantity: 1,
                    },
                ],
            });

            const response = await request(app)
                .delete(`/orders/${otherOrder._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Not authorized');

            await Order.findByIdAndDelete(otherOrder._id);
        });

        it('should return 422 if the order ID format is invalid', async () => {
            const invalidOrderId = 'invalidOrderId';
            const response = await request(app)
                .delete(`/orders/${invalidOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(422);
            expect(response.body.message).toBe('Validation failed');
        });

        afterAll(async () => {
            if (createdOrderId) {
                await Order.findByIdAndDelete(createdOrderId);
            }
            await Cart.deleteMany({});
        });
    });

    afterAll(async () => {
        console.log('All tests completed. Closing database connection...');
        const { closeConnection } = require('../util/database');
        await closeConnection();
    });
});
