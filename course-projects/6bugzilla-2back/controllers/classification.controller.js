const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Classification = require('../models/classification.model');

exports.getClassifications = async (req, res, next) => {
    console.log('The getClassifications controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Classification.find().countDocuments()
        .then(count => {
            total = count;
            return Classification.find()
                .populate('products')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(classifications => {
            res.status(200).json({
                message: 'Classifications fetched successfully',
                classifications,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Classifications fetch failed');
        });
}

exports.createClassification = async (req, res, next) => {
    console.log('The createClassification controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const name = req.body.name;
    const description = req.body.description;
    const products = req.body.products;
    const classification = new Classification({
        name,
        description,
        products
    });
    classification.save()
        .then(result => {
            console.log('Classification created successfully with result:', result);
            res.status(201).json({
                message: 'Classification created successfully',
                classification: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Classification creation failed');
        });
}

exports.getClassification = async (req, res, next) => {
    const classificationId = req.params.classificationId;
    Classification.findById(classificationId)
        .then(classification => {
            if (!classification) {
                throwError(404, '', 'Classification not found');
            }
            res.status(200).json({
                message: 'Classification fetched successfully',
                classification
            });
        })
        .catch(err => {
            handleError(err, next, 'Classification fetch failed');
        });
}

exports.updateClassification = async (req, res, next) => {
    const classificationId = req.params.classificationId;
    const name = req.body.name;
    const description = req.body.description;
    const products = req.body.products;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    Classification.findById(classificationId)
        .then(classification => {
            if (!classification) {
                throwError(404, '', 'Classification not found');
            }
            classification.name = name;
            classification.description = description;
            classification.products = products;
            return classification.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Classification updated successfully',
                classification: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Classification update failed');
        });
}

exports.deleteClassification = async (req, res, next) => {
    const classificationId = req.params.classificationId;
    Classification.findByIdAndDelete(classificationId)
        .then(result => {
            res.status(200).json({
                message: 'Classification deleted successfully',
                classification: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Classification deletion failed');
        });
}