const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');
const transporter = require('../util/email-sender');

const Component = require('../models/component.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.getComponents = async (req, res, next) => {
    console.log('The getComponents controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Component.find().countDocuments()
        .then(count => {
            total = count;
            return Component.find()
                .populate('product')
                .populate('assignee')
                .populate('CC')
                .populate('bugs')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(components => {
            res.status(200).json({
                message: 'Components fetched successfully',
                components,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Components fetch failed');
        });
}

exports.createComponent = async (req, res, next) => {
    console.log('The createComponent controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const product = req.body.product;
    const name = req.body.name;
    const description = req.body.description;
    const assignee = req.body.assignee;
    const CC = req.body.CC;
    const bugs = req.body.bugs;
    const component = new Component({
        product,
        name,
        description,
        assignee,
        CC,
        bugs
    });
    component.save()
        .then(result => {
            console.log('Component created successfully with result:', result);
            return Product.findById(product);
        })
        .then(product => {
            product.components.push(component);
            return product.save();
        })
        .then(result => {
            console.log('Product updated with component:', result);
            return User.findById(assignee);
        })
        .then(user => {
            if (user) {
                const mailOptions = {
                    to: user.email,
                    from: 'gabrielsalomon.990@gmail.com',
                    subject: 'New Component Assignment',
                    html: `<h1>You have been assigned a new component:</h1>
                    <h3>Component: ${name}</h3>
                    <h3>Description: ${description}</h3>
                    <p>Please check the bug tracking system for more details.</p>
                    <a href="http://localhost:3006/components/${component._id}">Go To Component</a>`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            }
            res.status(201).json({
                message: 'Component created successfully',
                component
            });
        })
        .catch(err => {
            handleError(err, next, 'Component creation failed');
        });
};

exports.getComponent = async (req, res, next) => {
    const componentId = req.params.componentId;
    Component.findById(componentId)
        .populate('product')
        .populate('assignee')
        .populate('CC')
        .populate('bugs')
        .then(component => {
            if (!component) {
                throwError(404, [], 'Component not found');
            }
            res.status(200).json({
                message: 'Component fetched successfully',
                component
            });
        })
        .catch(err => {
            handleError(err, next, 'Component fetch failed');
        });
}

exports.updateComponent = async (req, res, next) => {
    const componentId = req.params.componentId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const product = req.body.product;
    const name = req.body.name;
    const description = req.body.description;
    const assignee = req.body.assignee;
    const CC = req.body.CC;
    const bugs = req.body.bugs;
    Component.findById(componentId)
        .then(component => {
            if (!component) {
                throwError(404, [], 'Component not found');
            }
            component.product = product;
            component.name = name;
            component.description = description;
            component.assignee = assignee;
            component.CC = CC;
            component.bugs = bugs;
            return component.save();
        })
        .then(result => {
            console.log('Component updated successfully with result:', result);
            res.status(200).json({
                message: 'Component updated successfully',
                component: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Component update failed');
        });
}

exports.deleteComponent = async (req, res, next) => {
    console.log('The deleteComponent controller was called with params:', req.params);
    const componentId = req.params.componentId;
    Component.findByIdAndDelete(componentId)
        .then(result => {
            if (!result) {
                throwError(404, [], 'Component not found');
            }
            console.log('Component deleted successfully with result:', result);
            return Product.findById(result.product);
        })
        .then(product => {
            product.components.pull(componentId);
            return product.save();
        })
        .then(result => {
            console.log('Product updated with component deleted', result);
            res.status(200).json({
                message: 'Component deleted successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Component delete failed');
        });
}