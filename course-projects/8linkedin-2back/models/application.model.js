const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: String
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);