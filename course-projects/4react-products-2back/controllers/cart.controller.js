const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.getUserCart = async (req, res, next) => {
    Cart.findOne({user: req.userId})
        .populate('products.product')
        .then(cart => {
            if (!cart) {
                throwError(404, '', 'Cart not found');
            }
            res.status(200).json({
                message: 'Cart fetched successfully',
                cart
            });
        })
        .catch(err => {
            handleError(err, next, 'Cart fetch failed');
        });
}

exports.addToCart = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                throwError(404, '', 'Product not found');
            }
            return Cart.findOne({user: req.userId});
        })
        .then(cart => {
            if (!cart) {
                const cart = new Cart({
                    user: req.userId,
                    products: [{product: productId, quantity}]
                });
                return cart.save();
            }
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex >= 0) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({product: productId, quantity});
            }
            return cart.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Product added to cart successfully',
                cart: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Product add to cart failed');
        });
}

exports.deleteProductFromCart = async (req, res, next) => {
    const productId = req.params.productId;
    Cart.findOne({user: req.userId})
        .then(cart => {
            if (!cart) {
                throwError(404, '', 'Cart not found');
            }
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex < 0) {
                throwError(404, '', 'Product not found in cart');
            }
            cart.products.splice(productIndex, 1);
            return cart.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Product deleted from cart successfully',
                cart: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Product delete from cart failed');
        });
}