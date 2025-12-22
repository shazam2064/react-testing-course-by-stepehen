const express = require('express');
const { body } = require('express-validator');
const tweetController = require('../controllers/tweet.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', tweetController.getTweets);
router.get('/:tweetId', tweetController.getTweet);
router.post('/', isAuth, tweetController.createTweet);
router.put('/:tweetId', isAuth, tweetController.updateTweet);
router.put('/like/:tweetId', isAuth, tweetController.likeTweet);
router.put('/retweet/:tweetId', isAuth, tweetController.reTweet);
router.delete('/:tweetId', isAuth, tweetController.deleteTweet);

module.exports = router;
