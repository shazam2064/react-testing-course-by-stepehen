const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Tweet = require('../models/tweet.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const path = require("path");
const fs = require("fs");

exports.getTweets = async (req, res, next) => {
    // #swagger.description = 'Retrieve all tweets'
    // #swagger.tags = ['Tweets']
    console.log('the getTweets controller was called');
    Tweet.find()
        .populate('creator')
        .populate({
            path: 'comments',
            populate: {
                path: 'creator'
            }
        })
        .then(tweets => {
            res.status(200).json({
                message: 'Tweets fetched successfully',
                tweets
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweets fetch failed');
        });
};

exports.getTweet = async (req, res, next) => {
    // #swagger.description = 'Retrieve a single tweet by ID'
    // #swagger.tags = ['Tweets']
    const tweetId = req.params.tweetId;
    console.log('the getTweet controller was called with tweetId: ', tweetId);
    Tweet
        .findById(tweetId)
        .populate('creator')
        .populate({
            path: 'comments',
            populate: {
                path: 'creator'
            }
        })
        .then(tweet => {
            if (!tweet) {
                throwError(404, '', 'Tweet not found');
            }
            res.status(200).json({
                message: 'Tweet fetched successfully',
                tweet
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweet fetch failed');
        });
};

exports.createTweet = async (req, res, next) => {
    // #swagger.description = 'Create a new tweet'
    // #swagger.tags = ['Tweets'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the createTweet controller was called');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    const text = req.body.text;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }
    let creator;

    const tweetData = {
        text,
        creator: req.userId
    };

    if (imageUrl !== 'undefined' && imageUrl && req.file) {
        tweetData.image = imageUrl;
    }

    const tweet = new Tweet(tweetData);
    tweet.save()
        .then(result => {
            console.log('tweet created successfully', result);
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.tweets.push(tweet)
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Tweet created successfully',
                tweet,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweet create failed');
        });
};

exports.updateTweet = async (req, res, next) => {
    // #swagger.description = 'Update an existing tweet'
    // #swagger.tags = ['Tweets'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the updateTweet controller was called');
    const tweetId = req.params.tweetId;
    const text = req.body.text;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    Tweet.findById(tweetId)
        .then(tweet => {
            if (!tweet) {
                throwError(404, '', 'Tweet not found');
            }
            if (imageUrl && imageUrl !== tweet.image && tweet.image) {
                clearImage(tweet.image);
            }

            tweet.text = text;
            tweet.image = imageUrl;
            return tweet.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Tweet updated successfully',
                tweet: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweet update failed');
        });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('The image deletion failed:', err));
}

exports.likeTweet = async (req, res, next) => {
    // #swagger.description = 'Like or unlike a tweet'
    // #swagger.tags = ['Tweets'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the likeTweet controller was called');
    const tweetId = req.params.tweetId;
    Tweet.findById(tweetId)
        .then(tweet => {
            if (!tweet) {
                throwError(404, '', 'Tweet not found');
            }
            if (tweet.likes.includes(req.userId)) {
                tweet.likes.pull(req.userId);
            }
            else {
                tweet.likes.push(req.userId);
            }
            return tweet.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Tweet liked successfully',
                tweet: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweet like failed');
        });
};

exports.reTweet = async (req, res, next) => {
    // #swagger.description = 'Retweet or unretweet a tweet'
    // #swagger.tags = ['Tweets'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the reTweet controller was called');
    const tweetId = req.params.tweetId;
    Tweet.findById(tweetId)
        .then(tweet => {
            if (!tweet) {
                throwError(404, '', 'Tweet not found');
            }
            if (tweet.retweets.includes(req.userId)) {
                tweet.retweets.pull(req.userId);
            }
            else {
                tweet.retweets.push(req.userId);
            }
            return tweet.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Retweet success',
                tweet: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Retweet failed');
        });
};

const { deleteComment } = require('./comment.controller');

exports.deleteTweet = async (req, res, next) => {
    // #swagger.description = 'Delete a tweet'
    // #swagger.tags = ['Tweets'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the deleteTweet controller was called');
    const tweetId = req.params.tweetId;

    Tweet.findById(tweetId)
        .populate('comments')
        .then(tweet => {
            if (!tweet) {
                throwError(404, '', 'Tweet not found');
            }

            const commentDeletionPromises = tweet.comments.map(comment =>
                deleteComment({ params: { commentId: comment._id } }, res, next)
            );

            return Promise.all(commentDeletionPromises).then(() => tweet);
        })
        .then(tweet => {
            return Tweet.findByIdAndDelete(tweetId);
        })
        .then(tweet => {
            console.log('tweet deleted successfully', tweet);
            return User.findById(tweet.creator);
        })
        .then(user => {
            // guard for plain JS objects (tests) vs Mongoose documents
            if (!user) {
                throwError(404, '', 'User not found');
            }

            if (user.tweets && typeof user.tweets.pull === 'function') {
                // Mongoose array
                user.tweets.pull(tweetId);
            } else if (Array.isArray(user.tweets)) {
                // plain array from tests/mocks
                user.tweets = user.tweets.filter(id => String(id) !== String(tweetId));
            } else {
                user.tweets = [];
            }

            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Tweet deleted successfully',
                tweet: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Tweet delete failed');
        });
};