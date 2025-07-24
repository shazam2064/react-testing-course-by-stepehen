exports.globalResponse = (error, req, res, next) => {
    console.log('The app middleware got an error:', error);
    const status = error.statusCode || 500;
    const response = {message: error.message};
    if (error.details) {
        response.details = error.details;
    }
    res.status(status).json(response);
};