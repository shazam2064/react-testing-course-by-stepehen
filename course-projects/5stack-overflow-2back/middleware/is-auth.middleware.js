const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../util/jwt-secret');
const {throwError} = require('../controllers/error.controller');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throwError(401, '', 'Not authenticated.')
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.log('The is-auth middleware error:', JSON.stringify(err));
        if (err.name === 'TokenExpiredError') {
            throwError(401, '', 'Token has expired.');
        } else {
            throwError(500, '', 'Token was not valid.');
        }
    }
    if (!decodedToken) {
        throwError(401, '', 'Not authenticated.');
    }
    console.log('The is-auth middleware decoded token for user:', decodedToken.userId);
    req.userId = decodedToken.userId;
    next();
};