const { getUserOrders, getOrderById, createOrder, deleteOrder } = require('../controllers/order.controller');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const { validationResult } = require('express-validator');

jest.mock('../models/order.model');
jest.mock('../models/cart.model');
jest.mock('express-validator');

describe('Order Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, userId: 'mockUserId' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getUserOrders', () => {
        it('should fetch all orders for a user and return 200', async () => {
            Order.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([{ orderList: [], creator: 'mockUserId' }])
            });

            await getUserOrders(req, res, next);

            expect(Order.find).toHaveBeenCalledWith({ creator: 'mockUserId' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Orders fetched successfully',
                orders: [{ orderList: [], creator: 'mockUserId' }]
            });
        });

        it('should handle errors during fetching orders', async () => {
            Order.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await getUserOrders(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getOrderById', () => {
        it('should fetch an order by ID and return 200', async () => {
            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ orderList: [], creator: 'mockUserId' })
            });

            req.params.orderId = 'mockOrderId';

            await getOrderById(req, res, next);

            expect(Order.findById).toHaveBeenCalledWith('mockOrderId');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Order fetched successfully',
                order: { orderList: [], creator: 'mockUserId' }
            });
        });

        it('should handle order not found', async () => {
            Order.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            req.params.orderId = 'mockOrderId';

            await getOrderById(req, res, next);

            expect(Order.findById).toHaveBeenCalledWith('mockOrderId');
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('createOrder', () => {
        it('should create an order and return 201', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            Cart.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    products: [{ product: 'mockProduct', quantity: 2 }]
                })
            });
            Order.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({ _id: 'mockOrderId', orderList: [], creator: 'mockUserId' })
            }));
            Cart.prototype.save = jest.fn().mockResolvedValue({});

            await createOrder(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(Cart.findOne).toHaveBeenCalledWith({ user: 'mockUserId' });
            expect(Order).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Order created successfully',
                order: expect.any(Object)
            });
        });

        it('should handle validation errors', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid input' }]
            });

            await createOrder(req, res, next);

            expect(validationResult).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: [{ msg: 'Invalid input' }]
            });
        });

        it('should handle cart not found', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            Cart.findOne.mockResolvedValue(null);

            await createOrder(req, res, next);

            expect(Cart.findOne).toHaveBeenCalledWith({ user: 'mockUserId' });
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order and return 200', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            Order.findById.mockResolvedValue({
                creator: 'mockUserId'
            });
            Order.findByIdAndDelete.mockResolvedValue({});

            req.params.orderId = 'mockOrderId';

            await deleteOrder(req, res, next);

            expect(Order.findById).toHaveBeenCalledWith('mockOrderId');
            expect(Order.findByIdAndDelete).toHaveBeenCalledWith('mockOrderId');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
        });

        it('should handle order not found', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            Order.findById.mockResolvedValue(null);

            req.params.orderId = 'mockOrderId';

            await deleteOrder(req, res, next);

            expect(Order.findById).toHaveBeenCalledWith('mockOrderId');
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});