const { validationResult } = require('express-validator');
const { handleError, throwError } = require('./error.controller');

const Tag = require('../models/tag.model');
const Question = require('../models/question.model');
const User = require('../models/user.model');
const Answer = require('../models/answer.model');

exports.getTags = (req, res, next) => {
    console.log('The getTags controller was called with query:', req.query);
    Tag.find()
        .then(tags => {
            res.status(200).json({
                message: 'Tags fetched successfully',
                tags
            });
        })
        .catch(err => {
            handleError(err, next, 'Tags fetch failed');
        });
}


exports.createTag = (req, res, next) => {
    console.log('The createTag controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const name = req.body.name;
    const description = req.body.description;
    const tag = new Tag({
        name,
        description
    });
    tag.save()
        .then(result => {
            console.log('Tag created successfully with result:', result);
            res.status(201).json({
                message: 'Tag created successfully',
                tag
            });
        })
        .catch(err => {
            handleError(err, next, 'Tag creation failed');
        });
}

exports.updateTag = (req, res, next) => {
    console.log('The updateTag controller was called with params:', req.params, 'and body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const tagId = req.params.tagId;
    const name = req.body.name;
    const description = req.body.description;
    Tag.findById(tagId)
        .then(tag => {
            if (!tag) {
                throwError(404, '', 'Could not find the tag with id: ' + tagId);
            }
            tag.name = name;
            tag.description = description;
            return tag.save();
        })
        .then(result => {
            console.log('Tag updated successfully with result:', result);
            res.status(200).json({
                message: 'Tag updated successfully',
                tag: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Tag update failed');
        });
}

exports.deleteTag = (req, res, next) => {
    console.log('The deleteTag controller was called with params:', req.params);
    const tagId = req.params.tagId;
    Tag.findByIdAndDelete(tagId)
        .then(result => {
            if (!result) {
                throwError(404, '', 'Could not find the tag with id: ' + tagId);
            }
            res.status(200).json({
                message: 'Tag deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Tag deletion failed');
        });
}