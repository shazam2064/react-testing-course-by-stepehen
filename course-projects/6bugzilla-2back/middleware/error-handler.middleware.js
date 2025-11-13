exports.globalResponse = (error, req, res, next) => {
    console.log('The app middleware got an error:', error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message });
};