const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.getComments = async (req, res, next) => {
    // #swagger.description = 'Gets all comments for a specific post.'
    // #swagger.tags = ['Comments']
    console.log('The getComments controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Comment.find().countDocuments()
        .then(count => {
            total = count;
            return Comment.find()
                .populate('post')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(comments => {
            res.status(200).json({
                message: 'Comments fetched successfully',
                comments,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Comments fetch failed');
        });
};

exports.createComment = async (req, res, next) => {
    // #swagger.description = 'Creates a new comment for a specific post.'
    // #swagger.tags = ['Comments'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The createComment controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const postId = req.body.post;
    const text = req.body.text;
    let creator;
    const comment = new Comment({
        post: postId,
        text,
        creator: req.userId
    });
    comment.save()
        .then(result => {
            console.log('Comment created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for post creator:', user);
            creator = user;
            user.comments.push(comment);
            user.save();
            return Post.findById(postId);
        })
        .then(post => {
            console.log('Comment added to post successfully with result:', post);
            post.comments.push(comment);
            return post.save();
        })
        .then(result => {
            console.log('Post updated with comment:', result);
            res.status(201).json({
                message: 'Comment created successfully',
                comment,
                creator: { _id: req.userId, name: req.userName }
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment creation failed');
        });
};

exports.updateComment = async (req, res, next) => {
    // #swagger.description = 'Updates an existing comment.'
    // #swagger.tags = ['Comments'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The updateComment controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const commentId = req.params.commentId;
    const text = req.body.text;
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                throwError(404, [], 'Comment not found');
            }
            if (comment.creator.toString() !== req.userId) {
                throwError(403, [], 'Not authorized to update comment');
            }
            comment.text = text;
            return comment.save();
        })
        .then(result => {
            console.log('Comment updated successfully with result:', result);
            res.status(200).json({
                message: 'Comment updated successfully',
                comment: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment update failed');
        });
};

exports.likeComment = async (req, res, next) => {
    // #swagger.description = 'Likes or unlikes a comment.'
    // #swagger.tags = ['Comments'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the likeComment controller was called');
    const commentId = req.params.commentId;
    Comment.findById(commentId)
        .then(comment => {
            if (!comment) {
                throwError(404, '', 'Comment not found');
            }
            if (comment.likes.includes(req.userId)) {
                comment.likes.pull(req.userId);
            }
            else {
                comment.likes.push(req.userId);
            }
            return comment.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Comment liked successfully',
                comment: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment like failed');
        });
};

exports.deleteComment = async (req, res, next) => {
    // #swagger.description = 'Deletes a comment.'
    // #swagger.tags = ['Comments'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The deleteComment controller was called with params:', req.params);
    const commentId = req.params.commentId;
    let deletedComment;

    Comment.findByIdAndDelete(commentId)
        .then(result => {
            if (!result) {
                throwError(404, [], 'Comment not found');
            }
            console.log('Comment deleted successfully with result:', result);
            deletedComment = result;
            return Post.findById(result.post);
        })
        .then(post => {
            if (post) {
                post.comments.pull(commentId);
                return post.save();
            }
        })
        .then(() => {
            return User.findById(deletedComment.creator);
        })
        .then(user => {
            if (user) {
                user.comments.pull(commentId);
                return user.save();
            }
        })
        .then(() => {
            console.log('Comment deleted successfully from user and post.');
            res.status(200).json({
                message: 'Comment deleted successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment deletion failed');
        });
};