const express = require('express');
const connectionController = require('../controllers/connection.controller');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();
router.get('/', connectionController.getConnections);
router.post('/', isAuth, connectionController.createConnection);
router.put('/:connectionId', isAuth, connectionController.updateConnectionStatus);
router.delete('/:connectionId', isAuth, connectionController.deleteConnection);

module.exports = router;