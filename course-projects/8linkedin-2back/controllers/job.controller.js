const {validationResult} = require('express-validator');
const {handleError, throwError} = require('./error.controller');

const Job = require('../models/job.model');
const Application = require('../models/application.model');
const User = require('../models/user.model');
const path = require("path");
const fs = require("fs");

exports.getJobs = async (req, res, next) => {
    // #swagger.description = 'Retrieve all jobs'
    // #swagger.tags = ['Jobs']
    console.log('the getJobs controller was called');
    Job.find()
        .populate('creator')
        .populate({
            path: 'applicants',
            populate: {
                path: 'applicant'
            }
        })
        .then(jobs => {
            res.status(200).json({
                message: 'Jobs fetched successfully',
                jobs
            });
        })
        .catch(err => {
            handleError(err, next, 'Jobs fetch failed');
        });
};

exports.getJob = async (req, res, next) => {
    // #swagger.description = 'Retrieve a single job by ID'
    // #swagger.tags = ['Jobs']
    const jobId = req.params.jobId;
    console.log('the getJob controller was called with jobId: ', jobId);
    Job
        .findById(jobId)
        .populate('creator')
        .populate({
            path: 'applicants',
            populate: {
                path: 'applicant'
            }
        })
        .then(job => {
            if (!job) {
                throwError(404, '', 'Job not found');
            }
            res.status(200).json({
                message: 'Job fetched successfully',
                job
            });
        })
        .catch(err => {
            handleError(err, next, 'Job fetch failed');
        });
};

exports.createJob = async (req, res, next) => {
    // #swagger.description = 'Create a new job'
    // #swagger.tags = ['Jobs'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the createJob controller was called');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    const title = req.body.title;
    const company = req.body.company;
    const location = req.body.location;
    const description = req.body.description;
    let requirements = req.body.requirements;
    let creator;

    if (typeof requirements === 'string') {
        requirements = JSON.parse(requirements);
    }

    const jobData = {
        title,
        company,
        location,
        description,
        requirements,
        creator: req.userId
    };

    const job = new Job(jobData);
    job.save()
        .then(result => {
            console.log('job created successfully', result);
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.jobs.push(job)
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Job created successfully',
                job,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch(err => {
            handleError(err, next, 'Job create failed');
        });
};

exports.updateJob = async (req, res, next) => {
    // #swagger.description = 'Update an existing job'
    // #swagger.tags = ['Jobs'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the updateJob controller was called');
    const jobId = req.params.jobId;
    const title = req.body.title;
    const company = req.body.company;
    const location = req.body.location;
    const description = req.body.description;
    let requirements = req.body.requirements;

    if (typeof requirements === 'string') {
        requirements = JSON.parse(requirements);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwError(422, '', 'Validation failed');
    }

    Job.findById(jobId)
        .then(job => {
            if (!job) {
                throwError(404, '', 'Job not found');
            }

            job.title = title;
            job.company = company;
            job.location = location;
            job.description = description;
            job.requirements = requirements;
            return job.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Job updated successfully',
                job: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Job update failed');
        });
};

const { deleteApplication } = require('./application.controller');

exports.deleteJob = async (req, res, next) => {
    // #swagger.description = 'Delete a job'
    // #swagger.tags = ['Jobs'] #swagger.security = [{ "bearerAuth": [] }]
    console.log('the deleteJob controller was called');
    const jobId = req.params.jobId;

    Job.findById(jobId)
        .populate('applicants')
        .then(job => {
            if (!job) {
                throwError(404, '', 'Job not found');
            }

            const applicationDeletionPromises = job.applicants.map(applicant =>
                deleteApplication({ params: { applicationId: applicant._id } }, res, next)
            );

            return Promise.all(applicationDeletionPromises).then(() => job);
        })
        .then(job => {
            return Job.findByIdAndDelete(jobId);
        })
        .then(job => {
            console.log('job deleted successfully', job);
            return User.findById(job.creator);
        })
        .then(user => {
            user.jobs.pull(jobId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Job deleted successfully',
                job: result
            });
        })
        .catch(err => {
            handleError(err, next, 'Job delete failed');
        });
};