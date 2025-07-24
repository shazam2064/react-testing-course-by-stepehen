const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const isAuth = require('../middleware/is-auth.middleware');

const productValidator = [
    body('name').trim().isLength({ min: 5 }),
    body('price').isFloat(),
    body('description').trim().isLength({ min: 5 })
];

const router = express.Router();
router.get('/products', isAuth, productController.getProducts);
router.post('/products', isAuth, productValidator, productController.createProduct);
router.get('/products/:productId', isAuth, productController.getProduct);
router.put('/products/:productId', isAuth, productValidator, productController.updateProduct);
router.delete('/products/:productId', isAuth, productController.deleteProduct);

module.exports = router;