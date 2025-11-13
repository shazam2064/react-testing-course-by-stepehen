const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Product = require('../models/product.model');
const Classification = require('../models/classification.model');

exports.getProducts = async (req, res, next) => {
    console.log('The getProducts controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Product.find().countDocuments()
        .then(count => {
            total = count;
            return Product.find()
                .populate('classification')
                .populate({
                    path: 'components',
                    populate: {
                        path: 'assignee'
                    }
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(products => {
            res.status(200).json({
                message: 'Products fetched successfully',
                products,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Products fetch failed');
        });
}

exports.createProduct = async (req, res, next) => {
    console.log('The createProduct controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const classification = req.body.classification;
    const name = req.body.name;
    const description = req.body.description;
    const version = req.body.version;
    const components = req.body.components;
    const product = new Product({
        classification,
        name,
        description,
        version,
        components
    });
    product.save()
        .then(result => {
            console.log('Product created successfully with result:', result);
            return Classification.findById(classification);
        })
        .then(classification => {
            classification.products.push(product);
            return classification.save();
        })
        .then(result => {
            console.log('Classification updated with product:', result);
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
        .populate('classification')
        .then(product => {
            if (!product) {
                throwError(404, '', 'Product not found');
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
    const classification = req.body.classification;
    const name = req.body.name;
    const description = req.body.description;
    const version = req.body.version;
    const components = req.body.components;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    Product.findById(productId)
        .then(product => {
            if (!product) {
                throwError(404, '', 'Product not found');
            }
            product.classification = classification;
            product.name = name;
            product.description = description;
            product.version = version;
            product.components = components;
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

exports.deleteProduct = async (req, res, next) => {
    console.log('The deleteProduct controller was called with params:', req.params);
    const productId = req.params.productId;
    Product.findById(productId)
        .then(result => {
            if (!result) {
                throwError(404, '', 'Product not found');
            }
            return Classification.findById(result.classification);
        })
        .then(classification => {
            classification.products.pull(productId);
            classification.save();
            return Product.findByIdAndDelete(productId);
        })
        .then(result => {
            console.log('Classification updated with product deletion:', result);
            res.status(200).json({
                message: 'Product deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Product deletion failed');
        });
}