const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Comment = require('../models/comment.model');
const Tweet = require('../models/tweet.model');
const User = require('../models/user.model');

exports.getComments = async (req, res, next) => {
    // #swagger.description = 'Gets all comments for a specific tweet.'
    // #swagger.tags = ['Comments']
    console.log('The getComments controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Comment.find().countDocuments()
        .then(count => {
            total = count;
            return Comment.find()
                .populate('tweet')
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

// new: fetch single comment by id (supports :id or :commentId route param)
exports.getComment = async (req, res, next) => {
    // #swagger.description = 'Retrieve a single comment by ID.'
    // #swagger.tags = ['Comments']
    const commentId = req.params.commentId || req.params.id;
    console.log('The getComment controller was called with id:', commentId);

    // Build the query
    const query = Comment.findById(commentId)
        .populate('tweet')
        .populate('creator');

    // If it's a thenable (Mongoose Query or our test mock), use its promise interface.
    if (query && typeof query.then === 'function') {
        query
            .then(result => {
                const comment = result && result._doc ? result._doc : result;
                if (!comment) {
                    // explicit 404 JSON response so tests receive a predictable body
                    return res.status(404).json({ message: 'Comment not found' });
                }
                res.status(200).json({
                    message: 'Comment fetched successfully',
                    comment
                });
            })
            .catch(err => {
                handleError(err, next, 'Comment fetch failed');
            });
    } else {
        // Non-thenable (edge case in some test setups) — handle synchronously
        try {
            const result = query;
            const comment = result && result._doc ? result._doc : result;
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            res.status(200).json({
                message: 'Comment fetched successfully',
                comment
            });
        } catch (err) {
            handleError(err, next, 'Comment fetch failed');
        }
    }
};

exports.createComment = async (req, res, next) => {
    // #swagger.description = 'Creates a new comment for a specific tweet.'
    // #swagger.tags = ['Comments'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The createComment controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const tweetId = req.body.tweet;
    const text = req.body.text;
    let creator;
    const comment = new Comment({
        tweet: tweetId,
        text,
        creator: req.userId
    });
    comment.save()
        .then(result => {
            console.log('Comment created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for tweet creator:', user);
            creator = user;
            user.comments.push(comment);
            user.save();
            return Tweet.findById(tweetId);
        })
        .then(tweet => {
            console.log('Comment added to tweet successfully with result:', tweet);
            tweet.comments.push(comment);
            return tweet.save();
        })
        .then(result => {
            console.log('Tweet updated with comment:', result);
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
    const commentId = req.params.commentId || req.params.id;
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
    const commentId = req.params.commentId || req.params.id;
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
    const commentId = req.params.commentId || req.params.id;
    let deletedComment;

    Comment.findByIdAndDelete(commentId)
        .then(result => {
            if (!result) {
                throwError(404, [], 'Comment not found');
            }
            console.log('Comment deleted successfully with result:', result);
            deletedComment = result;
            return Tweet.findById(result.tweet);
        })
        .then(tweet => {
            if (tweet) {
                // guard for plain arrays vs mongoose arrays
                if (tweet.comments && typeof tweet.comments.pull === 'function') {
                    tweet.comments.pull(commentId);
                } else if (Array.isArray(tweet.comments)) {
                    tweet.comments = tweet.comments.filter(id => String(id) !== String(commentId));
                }
                return tweet.save();
            }
        })
        .then(() => {
            return User.findById(deletedComment.creator);
        })
        .then(user => {
            if (user) {
                if (user.comments && typeof user.comments.pull === 'function') {
                    user.comments.pull(commentId);
                } else if (Array.isArray(user.comments)) {
                    user.comments = user.comments.filter(id => String(id) !== String(commentId));
                }
                return user.save();
            }
        })
        .then(() => {
            console.log('Comment deleted successfully from user and tweet.');
            res.status(200).json({
                message: 'Comment deleted successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment deletion failed');
        });
};