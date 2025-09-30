const express = require('express');
const { body } = require('express-validator');
const tagController = require('../controllers/tag.controller');
const isAuth = require('../middleware/is-auth.middleware');

const tagValidator = [
    body('name').trim().isLength({ min: 1 })
];

const router = express.Router();
router.get('/tags', tagController.getTags);
router.post('/tags', isAuth, tagValidator, tagController.createTag);
router.put('/tags/:tagId', isAuth, tagValidator, tagController.updateTag);
router.delete('/tags/:tagId', isAuth, tagController.deleteTag);

module.exports = router;