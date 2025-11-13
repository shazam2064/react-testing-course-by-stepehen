require('dotenv').config();
const {throwError} = require('../controllers/error.controller');

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET) {
    throwError(500, null, 'The JWT_SECRET environment variable is not set.');
}

module.exports = JWT_SECRET;