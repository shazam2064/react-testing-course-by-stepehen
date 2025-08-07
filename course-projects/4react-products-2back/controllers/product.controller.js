const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Product = require('../models/product.model');

exports.getProducts = async (req, res, next) => {
    try {
        const totalItems = await Product.countDocuments();
        console.log('Total items:', totalItems);

        const products = await Product.find()
        console.log('Products:', products);

        res.status(200).json({
            message: 'Products fetched successfully',
            products,
            totalItems,
        });
    } catch (err) {
        handleError(err, next, 'Products fetch failed');
    }
};

exports.createProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        error.details = errors.array();
        return next(error);
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        return next(error);
    }
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.file.path.replace(/\\/g, '/');
    const product = new Product({
        name,
        price,
        description,
        imageUrl,
        creator: req.userId
    });
    product.save()
        .then(result => {
            console.log('Product created successfully with result:', result);
            res.status(201).json({
                message: 'Product created successfully',
                product: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Product creation failed');
        });
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                throwError(404, '', 'Could not find the post with id:' + productId);
            }
            res.status(200).json({
                message: 'Product fetched successfully',
                product
            });
        })
        .catch(err => {
            handleError(err, next, 'Product fetch failed');
        });
}

exports.updateProduct = async (req, res, next) => {
    const productId = req.params.productId;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }
    if (!imageUrl) {
        throwError(422, '', 'No file picked');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    Product.findById(productId)
        .then(product => {
            if (!product) {
                throwError(404, '', 'Could not find the post with id:' + productId);
            }
            if (product.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            if (imageUrl !== product.imageUrl) {
                clearImage(product.imageUrl);
            }
            product.name = name;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;
            return product.save();
        })
        .then(result => {
            console.log('Product updated successfully with result:', result);
            res.status(200).json({
                message: 'Product updated successfully',
                product: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Product update failed');
        });
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('The image deletion failed:', err));
}

exports.deleteProduct = async (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                throwError(404, '', 'Could not find the post with id:' + productId);
            }
            if (product.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            clearImage(product.imageUrl);
            return Product.findByIdAndDelete(productId);
        })
        .then(() => {
            console.log('Product deleted successfully with id:', productId);
            res.status(200).json({
                message: 'Product deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Product deletion failed');
        });
}