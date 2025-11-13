exports.handleError = (err, next, message) => {
    console.log(message, err);
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

exports.throwError = (statusCode, errors, message) => {
    console.log(message, errors);
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}