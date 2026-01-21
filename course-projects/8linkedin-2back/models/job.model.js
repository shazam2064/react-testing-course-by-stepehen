const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    requirements: [String],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'Application'
    }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);