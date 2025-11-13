const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const isAuth = require('../middleware/is-auth.middleware');
const Comment = require('../models/comment.model');

const router = express.Router();
router.get('/comments', commentController.getComments);
router.post('/comments', isAuth, [
    body('bug').trim().isLength({ min: 1 }),
    body('text').trim().isLength({ min: 1 })
], commentController.createComment);
router.put('/comments/:commentId', isAuth, commentController.updateComment);
router.delete('/comments/:commentId', isAuth, commentController.deleteComment);

module.exports = router;