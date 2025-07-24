const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const isAuth = require('../middleware/is-auth.middleware');

const cartValidator = [
    body('productId').isMongoId(),
    body('quantity').isInt()
];

const router = express.Router();
router.get('/cart', isAuth, cartController.getUserCart);
router.post('/cart', isAuth, cartValidator, cartController.addToCart);
router.delete('/cart/:productId', isAuth, cartController.deleteProductFromCart);

module.exports = router;