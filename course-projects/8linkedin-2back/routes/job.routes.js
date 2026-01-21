const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/job.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', jobController.getJobs);
router.get('/:jobId', jobController.getJob);
router.post('/', isAuth, jobController.createJob);
router.put('/:jobId', isAuth, jobController.updateJob);
router.delete('/:jobId', isAuth, jobController.deleteJob);

module.exports = router;
