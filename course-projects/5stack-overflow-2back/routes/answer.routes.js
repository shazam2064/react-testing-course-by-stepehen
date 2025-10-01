const express = require('express');
const { body } = require('express-validator');
const answerController = require('../controllers/answer.controller');
const isAuth = require('../middleware/is-auth.middleware');

const answerValidator = [
    body('content').trim().isLength({ min: 3 })
];

const router = express.Router();
router.get('/answers/:questionId', answerController.getAnswers);
router.put('/answers/vote/:answerId', isAuth, answerController.voteAnswer);
router.post('/answers/', isAuth, answerValidator, answerController.createAnswer);
router.put('/answers/:answerId', isAuth, answerValidator, answerController.updateAnswer);
router.delete('/answers/:answerId', isAuth, answerController.deleteAnswer);

module.exports = router;