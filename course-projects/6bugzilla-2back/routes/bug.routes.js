const express = require('express');
const { body } = require('express-validator');
const bugController = require('../controllers/bug.controller');
const isAuth = require('../middleware/is-auth.middleware');
const Bug = require('../models/bug.model');

const router = express.Router();
router.get('/bugs', bugController.getBugs);
router.post('/bugs', isAuth, bugController.createBug);
router.get('/bugs/:bugId', bugController.getBug);
router.put('/bugs/:bugId', isAuth, bugController.updateBug);
router.delete('/bugs/:bugId', isAuth, bugController.deleteBug);

module.exports = router;