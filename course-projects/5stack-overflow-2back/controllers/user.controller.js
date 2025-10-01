const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');
const { handleError, throwError } = require('./error.controller');

const User = require('../models/user.model');
const {populate} = require("dotenv");

exports.getUsers = async (req, res, next) => {
    User.find()
        .then(users => {
            res.status(200).json({
                message: 'Users fetched successfully',
                users
            });
        })
        .catch(err => {
            handleError(err, next, 'Users fetch failed');
        });
}

exports.getUser = async (req, res, next) => {
    const userId = req.params.userId;
    User
        .findById(userId)
        .populate('questions')
        .populate('answers')
        .then(user => {
            if (!user) {
                throwError(404, '', 'User not found');
            }
            res.status(200).json({
                message: 'User fetched successfully',
                user
            });
        })
        .catch(err => {
            handleError(err, next, 'User fetch failed');
        });
}

exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const status = req.body.status;
    const isAdmin = req.body.isAdmin;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    User.findById(userId)
        .then(user => {
            if (!user) {
                throwError(404, '', 'User not found');
            }
            user.email = email;
            user.password = password;
            user.name = name;
            user.status = status;
            user.isAdmin = isAdmin;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'User updated successfully',
                user: result
            });
        })
        .catch(err => {
            handleError(err, next, 'User update failed');
        });
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
        .then(user => {
            if (!user) {
                throwError(404, '', 'User not found');
            }
            return User.findByIdAndDelete(userId);
        })
        .then(result => {
            res.status(200).json({
                message: 'User deleted successfully',
                result
            });
        })
        .catch(err => {
            handleError(err, next, 'User delete failed');
        });
}

exports.createUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const isAdmin = req.body.isAdmin;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                name,
                isAdmin
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User created successfully',
                user: result
            });
        })
        .catch(err => {
            handleError(err, next, 'User creation failed');
        });
}