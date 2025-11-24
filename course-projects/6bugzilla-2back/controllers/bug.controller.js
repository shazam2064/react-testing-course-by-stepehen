const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');
const transporter = require('../util/email-sender');

const Bug = require('../models/bug.model');
const BugHistory = require('../models/bug-history.model');
const Component = require('../models/component.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');

exports.getBugs = async (req, res, next) => {
    console.log('The getBugs controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Bug.find().countDocuments()
        .then(count => {
            total = count;
            return Bug.find()
                .populate('product')
                .populate('component')
                .populate('CC')
                .populate('assignee')
                .populate('reporter')
                .populate('dependencies')
                .populate({
                    path: 'comments',
                    populate: { path: 'creator' }
                })
                .populate('history')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(bugs => {
            res.status(200).json({
                message: 'Bugs fetched successfully',
                bugs,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Bugs fetch failed');
        });
}

exports.createBug = async (req, res, next) => {
    console.log('The createBug controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    let bugId;
    const product = req.body.product;
    const component = req.body.component;
    const summary = req.body.summary;
    const description = req.body.description;
    const severity = req.body.severity;
    const priority = req.body.priority;
    const version = req.body.version;
    const hardware = req.body.hardware;
    const os = req.body.os;
    const status = req.body.status;
    const resolution = req.body.resolution;
    const CC = req.body.CC;
    const assignee = req.body.assignee;
    const reporter = req.userId;
    const deadline = req.body.deadline;
    const hoursWorked = req.body.hoursWorked;
    const hoursLeft = req.body.hoursLeft;
    const dependencies = req.body.dependencies;
    const attachment = req.file.path.replace(/\\/g, '/');
    const bug = new Bug({
        product,
        component,
        summary,
        description,
        severity,
        priority,
        version,
        hardware,
        os,
        status,
        resolution,
        CC,
        assignee,
        reporter,
        deadline,
        hoursWorked,
        hoursLeft,
        dependencies,
        attachment,
    });
    bug.save()
        .then(result => {
            console.log('Bug created successfully with result:', result);
            bugId = result._id;
            return Component.findById(component);
        })
        .then(component => {
            component.bugs.push(bug);
            return component.save();
        })
        .then(result => {
            console.log('Product updated with bug:', result);
            return Promise.all([
                User.findById(assignee),
                User.findById(reporter)
            ]);
        })
        .then(([assigneeUser, reporterUser]) => {
            if (assigneeUser) {
                assigneeUser.bugsAssigned.push(bugId);
                assigneeUser.save();
            }
            if (reporterUser) {
                reporterUser.reportedBugs.push(bugId);
                reporterUser.save();
            }
            return User.find({_id: {$in: CC}});
        })
        .then(users => {
            users.forEach(user => {
                const mailOptions = {
                    to: user.email,
                    from: 'gabrielsalomon.990@gmail.com',
                    subject: 'New Bug Created',
                    html: `<h1>A new bug has been created with the following details:</h1>
                    <h3>Summary: ${summary}</h3>
                    <h3>Description: ${description}</h3>
                    <p>Please check the bug tracking system for more details.</p>
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
                message: 'Bug created successfully',
                bug
            });
        })
        .catch(err => {
            handleError(err, next, 'Bug creation failed');
        });
};

exports.getBug = async (req, res, next) => {
    const bugId = req.params.bugId;
    Bug.findById(bugId)
        .populate('product')
        .populate('component')
        .populate('assignee')
        .populate('reporter')
        .populate('history')
        .then(bug => {
            if (!bug) {
                throwError(404, '', 'Bug not found');
            }
            res.status(200).json({
                message: 'Bug fetched successfully',
                bug
            });
        })
        .catch(err => {
            handleError(err, next, 'Bug fetch failed');
        });
}

exports.logBugChange = async (bugId, changes, userId) => {
    const fields = changes.map(change => change.field);
    const oldValues = changes.map(change => change.oldValue);
    const newValues = changes.map(change => change.newValue);

    const bugHistoryEntry = {
        bug: bugId,
        fields,
        oldValues,
        newValues,
        changedBy: userId
    };

    const createdHistory = await BugHistory.create(bugHistoryEntry);

    const bug = await Bug.findById(bugId);
    bug.history.push(createdHistory._id);
    await bug.save();
};

exports.updateBug = async (req, res, next) => {
    const bugId = req.params.bugId;
    const userId = req.userId;

    let attachment;
    if (req.file && req.file.path) {
        attachment = req.file.path.replace(/\\/g, '/');
    } else if (req.body && (req.body.image || req.body.attachment)) {
        attachment = req.body.image || req.body.attachment;
    } else {
        attachment = undefined;
    }

    const reporter = userId;
    const {
        product,
        component,
        summary,
        description,
        severity,
        priority,
        version,
        hardware,
        os,
        status,
        resolution,
        CC,
        assignee,
        deadline,
        hoursWorked,
        hoursLeft,
        dependencies,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }

    if (!attachment) {
        throwError(422, '', 'No image provided');
    }

    Bug.findById(bugId)
        .then(bug => {
            if (!bug) {
                throwError(404, '', 'Bug not found');
            }

            const changes = [];
            const fieldsToUpdate = {
                product,
                component,
                summary,
                description,
                severity,
                priority,
                version,
                hardware,
                os,
                status,
                resolution,
                CC,
                assignee,
                reporter,
                deadline,
                hoursWorked,
                hoursLeft,
                dependencies,
                attachment
            };

            for (let [field, newValue] of Object.entries(fieldsToUpdate)) {
                let oldValue = bug[field];

                if (field === 'deadline') {
                    if (oldValue) {
                        oldValue = (typeof oldValue.toLocaleDateString === 'function')
                            ? oldValue.toLocaleDateString()
                            : new Date(oldValue).toLocaleDateString();
                        const newDate = new Date(newValue);
                        newValue = newDate.toLocaleDateString();
                    } else {
                        // keep undefined oldValue as-is for comparison
                    }
                }

                const oldValueStr = Array.isArray(oldValue) ? JSON.stringify(oldValue) : oldValue?.toString();
                const newValueStr = Array.isArray(newValue) ? JSON.stringify(newValue) : newValue?.toString();

                const oldValueToCompare = oldValueStr === '[]' ? undefined : oldValueStr;
                const newValueToCompare = newValueStr === '[]' ? undefined : newValueStr;

                if (oldValueToCompare !== newValueToCompare) {
                    changes.push({field, oldValue, newValue});
                    bug[field] = newValue;
                }
            }

            return bug.save().then(() => changes);
        })
        .then(changes => {
            if (changes.length > 0) {
                return exports.logBugChange(bugId, changes, userId);
            }
        })
        .then(result => {
            console.log('Product updated with bug:', result);
            return User.find({_id: {$in: CC}});
        })
        .then(users => {
            users.forEach(user => {
                const mailOptions = {
                    to: user.email,
                    from: 'gabrielsalomon.980m@gmail.com',
                    subject: 'Bug Updated',
                    html: `<h1>A bug you are on the CC has been updated:</h1>
                    <h3>Summary: ${summary}</h3>
                    <h3>Status: ${status}</h3>
                    ${resolution ? `<h3>Resolution: ${resolution}</h3>` : ''}
                    <p>Please check the bug tracking system for more details.</p>
                    <a href="http://localhost:3006/history/${bugId}">Go To Bug History</a>`
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
                message: 'Bug updated successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Bug update failed');
        });
};

exports.deleteBug = async (req, res, next) => {
    const bugId = req.params.bugId;
    Bug.findByIdAndDelete(bugId)
        .then(bug => {
            if (!bug) {
                throwError(404, '', 'Bug not found');
            }
            console.log('Bug deleted:', bug);
            if (bug.comments.length > 0) {
                Comment.deleteMany({bug: bugId});
            }
            return Component.findById(bug.component);
        })
        .then(component => {
            component.bugs.pull(bugId);
            component.save();
            return BugHistory.deleteMany({bug: bugId});
        })
        .then(() => {
            console.log('Bug deleted successfully');
            res.status(200).json({
                message: 'Bug deleted successfully'
            });
        })
        .catch(err => {
            handleError(err, next, 'Bug deletion failed');
        });
}