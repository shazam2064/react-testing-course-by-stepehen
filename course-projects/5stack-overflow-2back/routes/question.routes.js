const express = require('express');
const { body } = require('express-validator');
const questionController = require('../controllers/question.controller');
const isAuth = require('../middleware/is-auth.middleware');

const questionValidator = [
    body('title').trim().isLength({ min: 3 }),
    body('content').trim().isLength({ min: 3 }),
    // body('tags').trim().isLength({ min: 1 })
];

const router = express.Router();
router.get('/questions', questionController.getQuestions);
router.get('/question/:tagId', questionController.getQuestionByTags);
router.put('/questions/vote/:questionId', isAuth, questionController.voteQuestion);
router.post('/questions', isAuth, questionValidator, questionController.createQuestion);
router.get('/questions/:questionId', questionController.getQuestion);
router.put('/questions/:questionId', isAuth, questionValidator, questionController.updateQuestion);
router.delete('/questions/:questionId', isAuth, questionController.deleteQuestion);

module.exports = router;