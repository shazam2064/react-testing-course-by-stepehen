
const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

exports.getUserOrders = async (req, res, next) => {
    Order.find({creator: req.userId})
        .populate('orderList.productItem')
        .then(orders => {
            res.status(200).json({
                message: 'Orders fetched successfully',
                orders
            });
        })
        .catch(err => {
            handleError(err, next, 'Orders fetch failed');
        });
}

exports.getOrderById = async (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .populate('orderList.productItem')
        .then(order => {
            if (!order) {
                throwError(404, '', 'Order not found');
            }
            res.status(200).json({
                message: 'Order fetched successfully',
                order
            });
        })
        .catch(err => {
            handleError(err, next, 'Order fetch failed');
        });
}

exports.createOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
        const cart = await Cart.findOne({ user: req.userId }).populate('products.product');
        if (!cart) {
            throwError(404, 'Cart not found', '');
        }

        if (cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderList = cart.products.map(cartItem => ({
            productItem: cartItem.product,
            quantity: cartItem.quantity
        }));

        const order = new Order({
            orderList,
            creator: req.userId
        });

        const savedOrder = await order.save();

        cart.products = [];
        await cart.save();

        res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder
        });
    } catch (err) {
        handleError(err, next, 'Order creation failed');
    }
};

exports.deleteOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throwError(404, '', 'Order not found');
        }

        if (order.creator.toString() !== req.userId) {
            throwError(403, '', 'Not authorized');
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        handleError(err, next, 'Order deletion failed');
    }
};