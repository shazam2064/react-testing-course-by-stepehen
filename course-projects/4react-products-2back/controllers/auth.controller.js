const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../util/jwt-secret');
const User = require('../models/user.model');

const { validationResult } = require('express-validator');
const {handleError, throwError} = require('./error.controller');

exports.signup = (req, res, next) => {
    console.log('The signup() method was called with req.body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const isAdmin = false;

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                name,
                isAdmin,
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            handleError(err, next, 'User creation failed');
        });
};

exports.login = (req, res, next) => {
   console.log('The login() method was called with req.body:', req.body);

        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;

        User.findOne({ email })
            .then(user => {
                if (!user) {
                    throwError(422, null, 'A user with this email could not be found');
                }
                loadedUser = user;
                return bcrypt.compare(password, user.password);
            })
            .then(isEqual => {
                if (!isEqual) {
                    throwError(422, null, 'Wrong password');
                }
                const token = jwt.sign({
                        email: loadedUser.email,
                        userId: loadedUser._id.toString()
                    },
                    JWT_SECRET,
                    { expiresIn: '1h' });
                res.status(200).json({ token, userId: loadedUser._id.toString(), email: loadedUser.email, isAdmin: loadedUser.isAdmin });
            })
            .catch(err => {
                handleError(err, next, 'Login failed');
            });
};

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                throwError(404, null, 'User not found');
            }
            res.status(200).json({ status: user.status });
        })
        .catch(err => {
            handleError(err, next, 'User status fetch failed');
        });
};
