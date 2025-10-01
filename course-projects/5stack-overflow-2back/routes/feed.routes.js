const express = require('express');
const { body } = require('express-validator');
const feedController = require('../controllers/feed.controller');
const isAuth = require('../middleware/is-auth.middleware');

const postValidator = [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
];

const router = express.Router();
router.get('/posts', isAuth, feedController.getPosts);
router.post('/posts', isAuth, postValidator, feedController.createPost);
router.get('/posts/:postId', isAuth, feedController.getPost);
router.put('/posts/:postId', isAuth, postValidator, feedController.updatePost);
router.delete('/posts/:postId', isAuth, feedController.deletePost);

module.exports = router;