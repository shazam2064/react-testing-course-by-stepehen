const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const isAuth = require('../middleware/is-auth.middleware');
const Product = require('../models/product.model');

const router = express.Router();
router.get('/products', productController.getProducts);
router.post('/products', isAuth, productController.createProduct);
router.get('/products/:productId', productController.getProduct);
router.put('/products/:productId', isAuth, productController.updateProduct);
router.delete('/products/:productId', isAuth, productController.deleteProduct);

module.exports = router;