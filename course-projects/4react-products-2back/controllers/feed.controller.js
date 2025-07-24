const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.getPosts = (req, res, next) => {
    console.log('The getPosts controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.status(200).json({
                message: 'Posts fetched successfully',
                posts,
                totalItems
            });
        })
        .catch(err => {
            handleError(err, next, 'Posts fetch failed');
        });
}

exports.createPost = (req, res, next) => {
    console.log('The createPost controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    if (!req.file) {
        throwError(422, '', 'No image provided');
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace(/\\/g, '/'); // Windows uses backslashes, so we need to replace them with forward slashes.
    let creator;
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    });
    post.save()
        .then(result => {
            console.log('Post created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for post creator:', user);
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            console.log('User updated with new post:', result);
            res.status(201).json({
                message: 'Post created successfully',
                post,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            handleError(err, next, 'Post creation failed');
        });
};

exports.getPost = (req, res, next) => {
    console.log('The getPost controller was called with params:', req.params);
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                throwError(404, '', 'Could not find the post with id: ' + postId); // this 'throw' will be caught by the catch block.
            }
            res.status(200).json({
                message: 'Post fetched',
                post
            });
        })
        .catch(err => {
            handleError(err, next, 'Post fetch failed');
        });
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
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

    Post.findById(postId)
        .then(post => {
            if (!post) {
                throwError(404, '', 'Could not find the post with id: ' + postId);
            }
            if (post.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Post updated successfully',
                post: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Post update failed');
        });
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('The image deletion failed:', err));
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                throwError(404, '', 'Could not find the post with id: ' + postId);
            }
            if (post.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            console.log('Post deleted successfully with result:', result);
            return User.findById(req.userId)
        })
        .then(user => {
            console.log('User found for post deletion:', user);
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            console.log('User post array was updated removing the deleted post with result:', result);
            res.status(200).json({
                message: 'Post deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Post deletion failed');
        });
}