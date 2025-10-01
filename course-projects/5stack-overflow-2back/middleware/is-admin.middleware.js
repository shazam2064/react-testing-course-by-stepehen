const User = require('../models/user.model');
const { throwError } = require('../controllers/error.controller');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            throwError(404, '', 'User not found.');
        }
        if (user.isAdmin === false) {
            throwError(401, '', 'Access denied. Admins only.');
        }
        next();
    } catch (err) {
        console.log('The is-admin middleware error:', JSON.stringify(err));
        next(err);
    }
};