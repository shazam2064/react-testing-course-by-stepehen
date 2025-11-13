const express = require('express');
const { body } = require('express-validator');
const componentController = require('../controllers/component.controller');
const isAuth = require('../middleware/is-auth.middleware');
const Component = require('../models/component.model');

const router = express.Router();
router.get('/components', componentController.getComponents);
router.post('/components', isAuth, componentController.createComponent);
router.get('/components/:componentId', componentController.getComponent);
router.put('/components/:componentId', isAuth, componentController.updateComponent);
router.delete('/components/:componentId', isAuth, componentController.deleteComponent);

module.exports = router;