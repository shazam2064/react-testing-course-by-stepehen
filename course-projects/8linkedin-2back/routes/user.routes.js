const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth.middleware');
const isAdmin = require('../middleware/is-admin.middleware');
const User = require('../models/user.model');
const userController = require("../controllers/user.controller");
const connectionController = require("../controllers/connection.controller");

const router = express.Router();
router.get('/', userController.getUsers);
router.get('/:userId', userController.getUser);
router.put('/:userId', isAuth, userController.updateUser);
router.put('/follow/:followingId', isAuth, connectionController.followUser);
router.delete('/:userId', isAuth, userController.deleteUser);
router.post('/',  isAuth, isAdmin, userController.createUser);

module.exports = router;