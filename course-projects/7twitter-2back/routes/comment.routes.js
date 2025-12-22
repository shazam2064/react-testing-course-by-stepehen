const express = require('express');
const { body } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', commentController.getComments);
router.post('/', isAuth, [
    body('text').trim().isLength({ min: 1 })
], commentController.createComment);
router.put('/:commentId', isAuth, commentController.updateComment);
router.put('/like/:commentId', isAuth, commentController.likeComment);
router.delete('/:commentId', isAuth, commentController.deleteComment);

module.exports = router;