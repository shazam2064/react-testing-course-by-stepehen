const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const path = require("path");
const fs = require("fs");

exports.getPosts = async (req, res, next) => {
    // #swagger.description = 'Retrieve all posts'
    // #swagger.tags = ['Posts']
    console.log('the getPosts controller was called');
    Post.find()
        .populate('creator')
        .populate({
            path: 'comments',
            populate: {
                path: 'creator'
            }
        })
        .then(posts => {
            res.status(200).json({
                message: 'Posts fetched successfully',
                posts
            });
        })
        .catch(err => {
            handleError(err, next, 'Posts fetch failed');
        });
};

exports.getPost = async (req, res, next) => {
    // #swagger.description = 'Retrieve a single post by ID'
    // #swagger.tags = ['Posts']
    const postId = req.params.postId;
    console.log('the getPost controller was called with postId: ', postId);
    Post
        .findById(postId)
        .populate('creator')
        .populate({
            path: 'comments',
            populate: {
                path: 'creator'
            }
        })
        .then(post => {
            if (!post) {
                throwError(404, '', 'Post not found');
            }
            res.status(200).json({
                message: 'Post fetched successfully',
                post
            });
        })
        .catch(err => {
            handleError(err, next, 'Post fetch failed');
        });
};

exports.createPost = async (req, res, next) => {
    // #swagger.description = 'Create a new post'
    // #swagger.tags = ['Posts'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the createPost controller was called');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }
    let creator;

    const postData = {
        content,
        creator: req.userId
    };

    if (imageUrl !== 'undefined' && imageUrl && req.file) {
        postData.image = imageUrl;
    }

    const post = new Post(postData);
    post.save()
        .then(result => {
            console.log('post created successfully', result);
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post)
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully',
                post,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => {
            handleError(err, next, 'Post create failed');
        });
};

exports.updatePost = async (req, res, next) => {
    // #swagger.description = 'Update an existing post'
    // #swagger.tags = ['Posts'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the updatePost controller was called');
    const postId = req.params.postId;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                throwError(404, '', 'Post not found');
            }
            if (imageUrl && imageUrl !== post.image && post.image) {
                clearImage(post.image);
            }

            post.content = content;
            post.image = imageUrl;
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
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('The image deletion failed:', err));
}

exports.likePost = async (req, res, next) => {
    // #swagger.description = 'Like or unlike a post'
    // #swagger.tags = ['Posts'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the likePost controller was called');
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                throwError(404, '', 'Post not found');
            }
            if (post.likes.includes(req.userId)) {
                post.likes.pull(req.userId);
            }
            else {
                post.likes.push(req.userId);
            }
            return post.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Post liked successfully',
                post: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Post like failed');
        });
};

const { deleteComment } = require('./comment.controller');

exports.deletePost = async (req, res, next) => {
    // #swagger.description = 'Delete a post'
    // #swagger.tags = ['Posts'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the deletePost controller was called');
    const postId = req.params.postId;

    Post.findById(postId)
        .populate('comments')
        .then(post => {
            if (!post) {
                throwError(404, '', 'Post not found');
            }

            const commentDeletionPromises = post.comments.map(comment =>
                deleteComment({ params: { commentId: comment._id } }, res, next)
            );

            return Promise.all(commentDeletionPromises).then(() => post);
        })
        .then(post => {
            return Post.findByIdAndDelete(postId);
        })
        .then(post => {
            console.log('post deleted successfully', post);
            return User.findById(post.creator);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Post deleted successfully',
                post: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Post delete failed');
        });
};