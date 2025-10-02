const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../util/jwt-secret');
const User = require('../models/user.model');
const transporter = require('../util/email-sender');

const { validationResult } = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const crypto = require('crypto');

exports.signup = (req, res, next) => {
    console.log('The signup() method was called with req.body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            details: errors.array(),
        });
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const isAdmin = false;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiration = Date.now() + 3600000; // 1 hour

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                name,
                isAdmin,
                verificationToken,
                verificationTokenExpiration
            });
            return user.save();
        })
        .then(result => {
            console.log('The auth postSignup() saved the user:', result);
            return transporter.sendMail({
                to: email,
                from: 'gabrielsalomon.980m@gmail.com',
                subject: 'Signup succeeded! Please verify your email',
                html: `<h1>You successfully signed up!</h1>
                       <p>Please verify your email by clicking the link below:</p>
                       <a href="http://localhost:3005/verify/${verificationToken}">Verify Email</a>`
            });
        })
        .then(result => {
            res.status(201).json({ message: 'User created! Please check your email to verify your account.', userId: result._id });
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
            if (user.verificationToken) {
                throwError(422, null, 'Please verify your email before logging in');
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

exports.verifyEmail = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ verificationToken: token })
        .then(user => {
            if (!user) {
                throwError(422, null, 'Token is invalid or has expired');
            }
            if (user.verificationTokenExpiration < Date.now()) {
                throwError(422, null, 'Token has expired');
            }
            user.verificationToken = undefined;
            user.verificationTokenExpiration = undefined;
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Email verified successfully! ' + result });
        })
        .catch(err => {
            handleError(err, next, 'Email verification failed: ' + err);
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

exports.updateUserStatus = (req, res, next) => {
    console.log('The updateUserStatus() method was called with req.body:', req.body);
    const newStatus = req.body.status;
    User.findById(req.userId)
        .then(user => {
            console.log('The user was found:', user);
            if (!user) {
                throwError(404, null, 'User not found');
            }
            user.status = newStatus;
            return user.save();
        })
        .then(result => {
            console.log('The user status was updated:', result);
            res.status(200).json({ message: 'User status updated' });
        })
        .catch(err => {
            handleError(err, next, 'User status update failed');
        });
};