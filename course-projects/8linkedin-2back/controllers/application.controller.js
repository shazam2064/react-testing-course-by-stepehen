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
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const jobId = req.body.job;
    let applicant;
    const resume = req.body.resume;
    const coverLetter = req.body.coverLetter;
    const status = req.body.status;

    const application = new Application({
        job: jobId,
        applicant: req.userId,
        resume,
        coverLetter,
        status
    });
    application.save()
        .then(result => {
            console.log('Application created successfully with result:', result);
            return User.findById(req.userId);
        })
        .then(user => {
            console.log('User found for job creator:', user);
            applicant = user;
            user.applications.push(application);
            user.save();
            return Job.findById(jobId);
        })
        .then(job => {
            console.log('Application added to job successfully with result:', job);
            job.applicants.push(application);
            return job.save();
        })
        .then(result => {
            console.log('Job updated with application:', result);
            res.status(201).json({
                message: 'Application created successfully',
                application,
                applicant: { _id: req.userId, name: req.userName }
            });
        })
        .catch(err => {
            handleError(err, next, 'Application creation failed');
        });
};

exports.updateApplication = async (req, res, next) => {
    // #swagger.description = 'Updates an existing application.'
    // #swagger.tags = ['Applications'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('The updateApplication controller was called with body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, errors.array(), 'Validation failed, entered data is incorrect');
    }
    const applicationId = req.params.applicationId;
    const resume = req.body.resume;
    const coverLetter = req.body.coverLetter;
    const status = req.body.status;
    Application.findById(applicationId)
        .then(application => {
            if (!application) {
                throwError(404, [], 'Application not found');
            }
            if (application.applicant.toString() === req.userId) {
                throwError(403, [], 'Not authorized to update application');
            }
            application.resume = resume;
            application.coverLetter = coverLetter;
            application.status = status;
            return application.save();
        })
        .then(result => {
            console.log('Application updated successfully with result:', result);
            res.status(200).json({
                message: 'Application updated successfully',
                application: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Application update failed');
        });
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