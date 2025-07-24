const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth.middleware');
const isAdmin = require('../middleware/is-admin.middleware');
const User = require('../models/user.model');
const userController = require("../controllers/user.controller");

const router = express.Router();
router.get('/users', isAuth, isAdmin, userController.getUsers);
router.get('/users/:userId', userController.getUser);
router.put('/users/:userId', isAuth, isAdmin, userController.updateUser);
router.delete('/users/:userId', isAuth, isAdmin, userController.deleteUser);
router.post('/users',  isAuth, isAdmin, userController.createUser);

module.exports = router;