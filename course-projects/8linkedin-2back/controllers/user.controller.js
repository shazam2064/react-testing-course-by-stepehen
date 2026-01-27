const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const { handleError, throwError } = require('./error.controller');

const User = require('../models/user.model');
const Connection = require('../models/connection.model');
const Job = require('../models/job.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

exports.getUsers = async (req, res, next) => {
    // #swagger.description = 'Gets all users.'
    // #swagger.tags = ['Users']
    User.find()
        .populate({
            path: 'jobs',
            populate: {
                path: 'creator',
            }
        })
        .populate({
            path: 'posts',
            populate: {
                path: 'creator',
            }
        })
        .populate({
            path: 'comments',
            populate: [
                { path: 'creator' },
                { path: 'post' }
            ]
        })
        .populate({
            path: 'conversations',
            populate: {
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                }
            }
        })
        .populate({
            path: 'applications',
            populate: {
                path: 'job',
            }
        })
        .populate({
            path: 'connections',
            populate: [
                { path: 'sender' },
                { path: 'receiver' }
            ]
        })
        .populate('following')
        .populate('followers')
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
            path: 'jobs',
            populate: {
                path: 'creator',
            }
        })
        .populate({
            path: 'posts',
            populate: {
                path: 'creator',
            }
        })
        .populate({
            path: 'comments',
            populate: [
                { path: 'creator' },
                { path: 'post' }
            ]
        })
        .populate({
            path: 'conversations',
            populate: {
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                }
            }
        })
        .populate({
            path: 'applications',
            populate: {
                path: 'job',
            }
        })
        .populate({
            path: 'connections',
            populate: [
                { path: 'sender' },
                { path: 'receiver' }
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

exports.createUser = async (req, res, next) => {
    // #swagger.description = 'Creates a new user.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const image = req.file ? req.file.path.replace(/\\/g, '/') : 'images/default.png';
    const headline = req.body.headline;
    const about = req.body.about;
    const location = req.body.location;
    let experience = req.body.experience;
    let education = req.body.education;
    let skills = req.body.skills;
    const isAdmin = req.body.isAdmin;

    if (typeof experience === 'string') {
        experience = JSON.parse(experience);
    }
    if (typeof education === 'string') {
        education = JSON.parse(education);
    }
    if (typeof skills === 'string') {
        skills = JSON.parse(skills);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
                image,
                name,
                headline,
                about,
                location,
                experience,
                education,
                skills,
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

exports.updateUser = async (req, res, next) => {
    // #swagger.description = 'Updates a user by ID.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const userId = req.params.userId;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    let imageUrl = req.body.image;
    const headline = req.body.headline;
    const about = req.body.about;
    const location = req.body.location;
    let experience = req.body.experience;
    let education = req.body.education;
    let skills = req.body.skills;
    const isAdmin = req.body.isAdmin;

    if (typeof experience === 'string') {
        experience = JSON.parse(experience);
    }
    if (typeof education === 'string') {
        education = JSON.parse(education);
    }
    if (typeof skills === 'string') {
        skills = JSON.parse(skills);
    }

    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
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
        user.headline = headline;
        user.about = about;
        user.location = location;
        user.experience = experience;
        user.education = education;
        user.skills = skills;
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

// export clearImage so tests can import it
exports.clearImage = clearImage;

const { deleteComment } = require('./comment.controller');
const { deleteJob } = require('./job.controller');
const { deletePost } = require('./post.controller');
const { deleteConnection } = require('./connection.controller');

exports.deleteUser = async (req, res, next) => {
    // #swagger.description = 'Deletes a user by ID.'
    // #swagger.tags = ['Users'] #swagger.security = [{ "bearerAuth": [] }]
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            throwError(404, '', 'User not found');
        }

        const jobs = await Job.find({ creator: userId });
        const jobDeletionPromises = jobs.map(job =>
            deleteJob({ params: { jobId: job._id } }, res, next)
        );
        await Promise.all(jobDeletionPromises);

        const posts = await Post.find({ creator: userId });
        const postDeletionPromises = posts.map(post =>
            deletePost({ params: { postId: post._id } }, res, next)
        );
        await Promise.all(postDeletionPromises);

        const comments = await Comment.find({ creator: userId });
        const commentDeletionPromises = comments.map(comment =>
            deleteComment({ params: { commentId: comment._id } }, res, next)
        );
        await Promise.all(commentDeletionPromises);

        const connections = await Connection.find({ $or: [{ sender: userId }, { receiver: userId }] });
        const connectionDeletionPromises = connections.map(connection =>
            deleteConnection({ params: { connectionId: connection._id } }, res, next)
        );
        await Promise.all(connectionDeletionPromises);

        const result = await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: 'User and related data deleted successfully',
            result
        });
    } catch (err) {
        handleError(err, next, 'User delete failed');
    }
};
