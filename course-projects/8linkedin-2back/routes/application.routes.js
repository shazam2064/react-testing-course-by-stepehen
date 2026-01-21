const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/application.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', applicationController.getApplications);
router.post('/', isAuth, [
    body('resume').trim().isLength({ min: 1 })
], applicationController.createApplication);
router.put('/:applicationId', isAuth, applicationController.updateApplication);
router.delete('/:applicationId', isAuth, applicationController.deleteApplication);

module.exports = router;