exports.globalResponse = (error, req, res, next) => {
    console.log('The app middleware got an error:', error);

    if (error && error.name === 'ValidationError' && error.errors) {
        const details = Object.keys(error.errors).map((key) => {
            const e = error.errors[key];
            return {
                type: 'field',
                value: e && Object.prototype.hasOwnProperty.call(e, 'value') ? e.value : undefined,
                msg: e && e.message ? e.message : String(e),
                path: e && e.path ? e.path : key,
                location: 'body'
            };
        });

        return res.status(422).json({
            message: 'Validation failed',
            details
        });
    }

    const status = error.statusCode || 500;
    const message = error.message || 'Server error';
    const payload = { message };

    if (error && error.details) payload.details = error.details;

    res.status(status).json(payload);
};