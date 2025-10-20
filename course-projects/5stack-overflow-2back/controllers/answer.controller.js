const { validationResult } = require('express-validator');
const { handleError, throwError } = require('./error.controller');

const Answer = require('../models/answer.model');
const Question = require('../models/question.model');
const User = require('../models/user.model');

exports.getAnswers = (req, res, next) => {
    console.log('The getAnswers controller was called with query:', req.query);
    const questionId = req.params.questionId;
    Answer.find({ questionId: questionId })
        .then(answers => {
            res.status(200).json({
                message: 'Answers fetched successfully',
                answers
            });
        })
        .catch(err => {
            handleError(err, next, 'Answers fetch failed');
        });
}

exports.createAnswer = (req, res, next) => {
    console.log('The createAnswer controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const content = req.body.content;
    const questionId = req.body.questionId;
    let creator;
    const answer = new Answer({
        content,
        questionId,
        creator: req.userId
    });
    answer.save()
        .then(result => {
            console.log('Answer created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for question creator:', user);
            creator = user;
            user.answers.push(answer);
            user.save();
            return Question.findById(questionId);
        })
        .then(question => {
            console.log('Question found for answer:', question);
            // question.answers.push(JSON.stringify(answer._id));
            question.answers.push(answer);
            return question.save();
        })
        .then(result => {
            console.log('Question updated with answer:', result);
            res.status(201).json({
                message: 'Answer created successfully',
                answer,
                creator: { _id: req.userId, name: req.userName }
            });
        })
        .catch(err => {
            handleError(err, next, 'Answer creation failed');
        });
}

exports.voteAnswer = (req, res, next) => {
    const answerId = req.params.answerId;
    const vote = req.body.vote;
    const userId = req.userId;

    Answer.findById(answerId)
        .then(answer => {
            if (!answer) {
                throwError(404, '', 'Could not find the answer with id: ' + answerId);
            }

            const existingVoteIndex = answer.voters.findIndex(voter => voter.userId.toString() === userId);
            if (existingVoteIndex !== -1) {
                const existingVote = answer.voters[existingVoteIndex].vote;
                if (existingVote === vote) {
                    return res.status(403).json({
                        message: 'Vote not changed'
                    });
                } else {
                    if (vote === 'up') {
                        answer.votes += 2;
                    } else if (vote === 'down') {
                        answer.votes -= 2;
                    }
                    answer.voters[existingVoteIndex].vote = vote;
                }
            } else {
                if (vote === 'up') {
                    answer.votes++;
                } else if (vote === 'down') {
                    answer.votes--;
                }
                answer.voters.push({ userId, vote });
            }

            return answer.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Vote recorded successfully',
                question: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Vote recording failed');
        });
}

exports.updateAnswer = (req, res, next) => {
    console.log('The updateAnswer controller was called with params:', req.params, 'and body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const answerId = req.params.answerId;
    const content = req.body.content;
    Answer.findById(answerId)
        .then(answer => {
            if (!answer) {
                throwError(404, [], 'Answer not found');
            }
            if (answer.creator.toString() !== req.userId) {
                throwError(403, [], 'Not authorized to update answer');
            }
            answer.content = content;
            return answer.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Answer updated successfully',
                answer: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Answer update failed');
        });
}

exports.deleteAnswer = (req, res, next) => {
    console.log('The deleteAnswer controller was called with params:', req.params);
    const answerId = req.params.answerId;
    Answer.findById(answerId)
        .then(answer => {
            if (!answer) {
                throwError(404, [], 'Answer not found');
            }
            if (answer.creator.toString() !== req.userId) {
                throwError(403, [], 'Not authorized to delete answer');
            }
            return Answer.findByIdAndDelete(answerId);
        })
        .then(result => {
            res.status(200).json({
                message: 'Answer deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Answer deletion failed');
        });
}