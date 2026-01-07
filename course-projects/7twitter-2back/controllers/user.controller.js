const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const { handleError, throwError } = require('./error.controller');

const User = require('../models/user.model');
const {populate} = require("dotenv");

exports.getUsers = async (req, res, next) => {
    // #swagger.description = 'Gets all users.'
    // #swagger.tags = ['Users']
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
};

exports.getUser = async (req, res, next) => {
    // #swagger.description = 'Gets a user by ID.'
    // #swagger.tags = ['Users']
    const userId = req.params.userId;
    User
        .findById(userId)
        .populate({
            path: 'tweets',
            populate: {
                path: 'creator',
            }
        })
        .populate({
            path: 'comments',
            populate: [
                { path: 'creator' },
                { path: 'tweet' }
            ]
        })
        .populate('following')
        .populate('followers')
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
};

exports.updateUser = async (req, res, next) => {
    // #swagger.description = 'Updates a user by ID.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const userId = req.params.userId;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    let imageUrl = req.body.image;
    const following = req.body.following;
    const followers = req.body.followers;
    const isAdmin = req.body.isAdmin;

    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // avoid throwing inside async handler — pass error to next so express error middleware responds
        const err = new Error('Validation failed');
        err.statusCode = 422;
        return next(err);
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            throwError(404, '', 'User not found');
        }
        if (imageUrl && imageUrl !== user.image && user.image) {
            clearImage(user.image);
        }

        user.email = email;
        user.name = name;
        user.image = imageUrl;
        user.following = following;
        user.followers = followers;
        user.isAdmin = isAdmin;

        if (password) {
            if (password !== user.password) {
                user.password = await bcrypt.hash(password, 12);
            } else {
                user.password = password;
            }
        }

        const result = await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user: result
        });
    } catch (err) {
        handleError(err, next, 'User update failed');
    }
};

const clearImage = filePath => {
    if (!filePath) {
        console.log('No file path provided for deletion');
        return;
    }
    if (path.basename(filePath) === 'default.png') {
        console.log('Default image will not be deleted.');
        return;
    }
    const fullPath = path.join(__dirname, '..', filePath);
    fs.unlink(fullPath, err => {
        if (err) {
            console.log('The image deletion failed:', err);
        }
    });
}

// export helper so tests can call it directly
exports.clearImage = clearImage;


exports.followUser = async (req, res, next) => {
    // #swagger.description = 'Follows or unfollows a user.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const followingId = req.params.followingId;
    const followerId = req.userId;
    User.findById(followingId)
        .then(userBeingFollowed => {
            if (!userBeingFollowed) {
                throwError(404, '', 'User not found');
            }
            if (userBeingFollowed.followers.includes(followerId)) {
                userBeingFollowed.followers.pull(followerId);
            } else {
                userBeingFollowed.followers.push(followerId);
            }
            userBeingFollowed.save();
        })
        .then(() => {
            return User.findById(followerId);
        })
        .then(userFollowingOtherUser => {
            if (!userFollowingOtherUser) {
                throwError(404, '', 'User not found');
            }
            if (userFollowingOtherUser.following.includes(followingId)) {
                userFollowingOtherUser.following.pull(followingId);
            } else {
                userFollowingOtherUser.following.push(followingId);
            }
            return userFollowingOtherUser.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'User followed/unfollowed successfully',
                result
            });
        })
        .catch(err => {
            handleError(err, next, 'User follow/unfollow failed');
        });
};

exports.deleteUser = async (req, res, next) => {
    // #swagger.description = 'Deletes a user by ID.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
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
};

exports.createUser = async (req, res, next) => {
    // #swagger.description = 'Creates a new user.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const image = req.file ? req.file.path.replace(/\\/g, '/') : 'images/default.png';
    const isAdmin = req.body.isAdmin;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // avoid throwing inside async handler — pass error to next so express error middleware responds
        const err = new Error('Validation failed');
        err.statusCode = 422;
        return next(err);
    }

    if (!email || !name || !password || typeof password !== 'string' || password.length < 6) {
        const err = new Error('Validation failed');
        err.statusCode = 422;
        return next(err);
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                image,
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
};