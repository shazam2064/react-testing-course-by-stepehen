const express = require('express');
const { body } = require('express-validator');
const classificationController = require('../controllers/classification.controller');
const isAuth = require('../middleware/is-auth.middleware');
const Classification = require('../models/classification.model');

const router = express.Router();
router.get('/classifications', classificationController.getClassifications);
router.post('/classifications', isAuth, classificationController.createClassification);
router.get('/classifications/:classificationId', classificationController.getClassification);
router.put('/classifications/:classificationId', isAuth, classificationController.updateClassification);
router.delete('/classifications/:classificationId', isAuth, classificationController.deleteClassification);

module.exports = router;