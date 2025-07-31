const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth.middleware');
const User = require('../models/user.model');

const signupValidations = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists!');
                    }
                    return true;
                })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .not().isEmpty(),
];

const statusValidations = [
    body('status')
        .trim()
        .not().isEmpty()
];

const router = express.Router();
router.put('/signup', signupValidations, authController.signup);
router.post('/login', authController.login);
router.get('/status', isAuth, authController.getUserStatus);

module.exports = router;