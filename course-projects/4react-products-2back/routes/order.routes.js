const express = require('express');
const { param} = require('express-validator');
const orderController = require('../controllers/order.controller');
const isAuth = require('../middleware/is-auth.middleware');

const orderValidator = [
    param('orderId').isMongoId().withMessage('The provided order id does not match an expected mongo id value.')
];

const router = express.Router();
router.get('/orders', isAuth, orderController.getUserOrders);
router.get('/orders/:orderId', isAuth, orderValidator, orderController.getOrderById);
router.post('/orders', isAuth, orderController.createOrder);
router.delete('/orders/:orderId', isAuth, orderValidator, orderController.deleteOrder);

module.exports = router;