const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');
const transporter = require('../util/email-sender');

const Comment = require('../models/comment.model');
const Bug = require('../models/bug.model');
const User = require('../models/user.model');

exports.getComments = async (req, res, next) => {
    console.log('The getComments controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Comment.find().countDocuments()
        .then(count => {
            total = count;
            return Comment.find()
                .populate('bug')
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
}

exports.createComment = async (req, res, next) => {
    console.log('The createComment controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Changed: return a proper 422 HTTP response instead of throwing to ensure tests receive a response
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            errors: errors.array()
        });
    }
    const bugId = req.body.bug;
    const text = req.body.text;
    const creator = req.userId;
    const comment = new Comment({
        bug: bugId,
        text,
        creator
    });
    comment.save()
        .then(result => {
            console.log('Comment created successfully with result:', result);
            return Bug.findById(bugId).populate('CC');
        })
        .then(bug => {
            bug.comments.push(comment);
            return bug.save().then(() => bug);
        })
        .then(bug => {
            console.log('Comment added to bug successfully with result:', bug);
            return User.find({ _id: { $in: bug.CC } });
        })
        .then(users => {
            users.forEach(user => {
                const mailOptions = {
                    to: user.email,
                    from: 'gabrielsalomon.990@gmail.com',
                    subject: 'New Comment Added',
                    html: `<h1>A new comment has been added to the bug you are following:</h1>
                    <h3>Comment: ${text}</h3>
                    <p>Please check the bug tracking system for more details:</p>
                    <a href="http://localhost:3006/bugs/${bugId}">Go To Bug</a>`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            });
            res.status(201).json({
                message: 'Comment created successfully',
                comment
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment creation failed');
        });
};

exports.updateComment = async (req, res, next) => {
    console.log('The updateComment controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            errors: errors.array()
        });
    }
    const commentId = req.params.commentId;
    const text = req.body.text;

    if (typeof text !== 'string' || text.trim() === '') {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            errors: [{
                type: 'field',
                value: text,
                msg: 'Invalid value',
                path: 'text',
                location: 'body'
            }]
        });
    }

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
}

exports.deleteComment = async (req, res, next) => {
    console.log('The deleteComment controller was called with params:', req.params);
    const commentId = req.params.commentId;
    Comment.findByIdAndDelete(commentId)
        .then(result => {
            if (!result) {
                throwError(404, [], 'Comment not found');
            }
            console.log('Comment deleted successfully with result:', result);
            return Bug.findById(result.bug);
        })
        .then(bug => {
            bug.comments.pull(commentId);
            return bug.save();
        })
        .then(result => {
            console.log('Comment deleted successfully with result:', result);
            res.status(200).json({
                message: 'Comment deleted successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Comment deletion failed');
        });
}