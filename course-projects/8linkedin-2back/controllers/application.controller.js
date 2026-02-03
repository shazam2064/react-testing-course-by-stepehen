const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Application = require('../models/application.model');
const Job = require('../models/job.model');
const User = require('../models/user.model');

exports.getApplications = async (req, res, next) => {
    // #swagger.description = 'Gets all applications for a specific job.'
    // #swagger.tags = ['Applications']
    console.log('The getApplications controller was called with query:', req.query);
    const currentPage = req.query.page || 1;
    const perPage = 50;
    let total;
    Application.find().countDocuments()
        .then(count => {
            total = count;
            return Application.find()
                .populate('job')
                .populate('applicant')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(applications => {
            res.status(200).json({
                message: 'Applications fetched successfully',
                applications,
                total
            });
        })
        .catch(err => {
            handleError(err, next, 'Applications fetch failed');
        });
};

exports.createApplication = async (req, res, next) => {
    // #swagger.description = 'Creates a new application for a specific job.'
    // #swagger.tags = ['Applications'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The createApplication controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation failed', errors.array());
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const jobId = req.body.job;
    const resume = req.body.resume;
    const coverLetter = req.body.coverLetter;
    const status = req.body.status;

    try {
        const application = new Application({
            job: jobId,
            applicant: req.userId,
            resume,
            coverLetter,
            status
        });

        const savedApplication = await application.save();
        console.log('Application created successfully with result:', savedApplication);

        const user = await User.findById(req.userId);
        if (user) {
            user.applications.push(savedApplication);
            await user.save();
        }

        const job = await Job.findById(jobId);
        if (job) {
            job.applicants.push(savedApplication);
            await job.save();
        }

        res.status(201).json({
            message: 'Application created successfully',
            application: savedApplication,
            applicant: { _id: req.userId, name: req.userName }
        });
    } catch (err) {
        handleError(err, next, 'Application creation failed');
    }
};

exports.updateApplication = async (req, res, next) => {
    // #swagger.description = 'Updates an existing application.'
    // #swagger.tags = ['Applications'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The updateApplication controller was called with body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation failed', errors.array());
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const applicationId = req.params.applicationId;
    const resume = req.body.resume;
    const coverLetter = req.body.coverLetter;
    const status = req.body.status;

    // Explicit validation: if a field is present but empty, treat as validation error
    if (typeof resume === 'string' && resume.trim() === '') {
        return res.status(422).json({
            message: 'Validation failed',
            errors: [{ type: 'field', value: resume, msg: 'Invalid value', path: 'resume', location: 'body' }]
        });
    }
    if (typeof coverLetter === 'string' && coverLetter.trim() === '') {
        return res.status(422).json({
            message: 'Validation failed',
            errors: [{ type: 'field', value: coverLetter, msg: 'Invalid value', path: 'coverLetter', location: 'body' }]
        });
    }

    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Authorization: only applicant can update
        if (application.applicant.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update application' });
        }

        application.resume = resume !== undefined ? resume : application.resume;
        application.coverLetter = coverLetter !== undefined ? coverLetter : application.coverLetter;
        application.status = status !== undefined ? status : application.status;

        const result = await application.save();
        console.log('Application updated successfully with result:', result);
        return res.status(200).json({
            message: 'Application updated successfully',
            application: result
        });
    } catch (err) {
        handleError(err, next, 'Application update failed');
    }
};

exports.deleteApplication = async (req, res, next) => {
    // #swagger.description = 'Deletes a application.'
    // #swagger.tags = ['Applications'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The deleteApplication controller was called with params:', req.params);
    const applicationId = req.params.applicationId;
    let deletedApplication;

    Application.findByIdAndDelete(applicationId)
        .then(result => {
            if (!result) {
                throwError(404, [], 'Application not found');
            }
            console.log('Application deleted successfully with result:', result);
            deletedApplication = result;
            return Job.findById(result.job);
        })
        .then(job => {
            if (job) {
                job.applicants.pull(applicationId);
                return job.save();
            }
        })
        .then(() => {
            return User.findById(deletedApplication.applicant);
        })
        .then(user => {
            if (user) {
                user.applications.pull(applicationId);
                return user.save();
            }
        })
        .then(() => {
            console.log('Application deleted successfully from user and job.');
            res.status(200).json({
                message: 'Application deleted successfully',
            });
        })
        .catch(err => {
            handleError(err, next, 'Application deletion failed');
        });
};