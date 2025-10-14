const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Question = require('../models/question.model');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');
const Answer = require('../models/answer.model');

exports.getQuestions = (req, res, next) => {
    console.log('The getQuestions controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Question.countDocuments()
        .then(count => {
            total = count;
            return Question.find()
                .populate('creator', 'name')
                .populate('tags')
                .populate({
                    path: 'answers',
                    populate: {
                        path: 'creator',
                        select: 'name email'
                    }
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(questions => {
            res.status(200).json({
                message: 'Questions fetched successfully',
                questions,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Questions fetch failed');
        });
}

exports.createQuestion = (req, res, next) => {
    console.log('The createQuestion controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags;
    let creator;
    const question = new Question({
        title,
        content,
        tags,
        creator: req.userId
    });
    question.save()
        .then(result => {
            console.log('Question created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for question creator:', user);
            creator = user;
            user.questions.push(question);
            return user.save();
        })
        .then(result => {
            console.log('User updated with question:', result);
            return Tag.find({_id: {$in: tags}});
        })
        .then(tags => {
            console.log('Tags found for question:', tags);
            tags.forEach(tag => {
                tag.questions.push(question);
                tag.save();
            });
            res.status(201).json({
                message: 'Question created successfully',
                question,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => {
            handleError(err, next, 'Question creation failed');
        });
}

exports.getQuestion = (req, res, next) => {
    console.log('The getQuestion controller was called with params:', req.params);
    const questionId = req.params.questionId;
    Question
        .findById(questionId)
        .populate('creator', 'name')
        .populate('tags')
        .populate({
            path: 'answers',
            populate: {
                path: 'creator',
                select: 'name email'
            }
        })
        .then(question => {
            if (!question) {
                throwError(404, '', 'Could not find the question with id: ' + questionId);
            }
            question.views += 0.5;
            return question.save();
        })
        .then(question => {
            res.status(200).json({
                message: 'Question fetched',
                question
            });
        })
        .catch(err => {
            handleError(err, next, 'Question fetch failed');
        });
}

exports.getQuestionByTags = (req, res, next) => {
    console.log('The getQuestionByTags controller was called with params:', req.params);
    const tagId = req.params.tagId;

    Question.find({ tags: tagId })
        .populate('creator', 'name')
        .populate('tags')
        .populate({
            path: 'answers',
            populate: {
                path: 'creator',
                select: 'name email'
            }
        })
        .then(questions => {
            if (!questions || questions.length === 0) {
                throwError(404, '', 'No questions found with the tag id: ' + tagId);
            }
            res.status(200).json({
                message: 'Questions fetched successfully',
                questions
            });
        })
        .catch(err => {
            handleError(err, next, 'Fetching questions by tag failed');
        });
};

exports.updateQuestion = (req, res, next) => {
    const questionId = req.params.questionId;
    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    Question.findById(questionId)
        .then(question => {
            if (!question) {
                throwError(404, '', 'Could not find the question with id: ' + questionId);
            }
            if (question.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            question.title = title;
            question.content = content;
            question.tags = tags;
            return question.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Question updated successfully',
                question: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Question update failed');
        });
}

exports.voteQuestion = (req, res, next) => {
    const questionId = req.params.questionId;
    const vote = req.body.vote;
    const userId = req.userId;

    Question.findById(questionId)
        .then(question => {
            if (!question) {
                throwError(404, '', 'Could not find the question with id: ' + questionId);
            }

            const existingVoteIndex = question.voters.findIndex(voter => voter.userId.toString() === userId);
            if (existingVoteIndex !== -1) {
                const existingVote = question.voters[existingVoteIndex].vote;
                if (existingVote === vote) {
                    return res.status(403).json({
                        message: 'Vote not changed'
                    });
                } else {
                    if (vote === 'up') {
                        question.votes += 2;
                    } else if (vote === 'down') {
                        question.votes -= 2;
                    }
                    question.voters[existingVoteIndex].vote = vote;
                }
            } else {
                if (vote === 'up') {
                    question.votes++;
                } else if (vote === 'down') {
                    question.votes--;
                }
                question.voters.push({userId, vote});
            }

            return question.save();
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

exports.deleteQuestion = (req, res, next) => {
    const questionId = req.params.questionId;
    Question.findById(questionId)
        .then(question => {
            if (!question) {
                throwError(404, '', 'Could not find the question with id: ' + questionId);
            }
            if (question.creator.toString() !== req.userId) {
                throwError(403, '', 'Not authorized');
            }
            return Question.findByIdAndDelete(questionId);
        })
        .then(result => {
            res.status(200).json({
                message: 'Question deleted successfully',
                question: result
            });
        })
        .then(result => {
            console.log('Question deleted successfully with result:', result);
            return User.findById(req.userId)
        })
        .then(user => {
            console.log('User found for post deletion:', user);
            user.questions.pull(questionId);
            return user.save();
        })
        .catch(err => {
            handleError(err, next, 'Question delete failed');
        });
}