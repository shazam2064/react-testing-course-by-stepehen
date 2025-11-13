const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bugHistorySchema = new Schema({
    bug: {
        type: Schema.Types.ObjectId,
        ref: 'Bug',
        required: true
    },
    fields: [{
        type: String,
    }],
    oldValues: [{
        type: Schema.Types.Mixed,
    }],
    newValues: [{
        type: Schema.Types.Mixed,
    }],
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BugHistory', bugHistorySchema);