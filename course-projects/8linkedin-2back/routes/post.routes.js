const express = require('express');
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', postController.getPosts);
router.get('/:postId', postController.getPost);
router.post('/', isAuth, postController.createPost);
router.put('/:postId', isAuth, postController.updatePost);
router.put('/like/:postId', isAuth, postController.likePost);
router.delete('/:postId', isAuth, postController.deletePost);

module.exports = router;
