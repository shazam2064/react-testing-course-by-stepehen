const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classificationSchema = new Schema({
    product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
    },
    component: {
        type: Schema.Types.ObjectId,
        ref: 'Component'
    },
    summary: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    hardware: {
        type: String,
        required: true
    },
    os: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    resolution: {
        type: String,
        required: false
    },
    CC: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    assignee: {
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    reporter: {
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    deadline: {
        type: Date,
        required: false
    },
    hoursWorked: {
        type: Number,
        required: false
    },
    hoursLeft: {
        type: Number,
        required: false
    },
    dependencies: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Bug',
            required: false
        }
    ],
    attachment: {
        type: String,
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    history: [
        {
            type: Schema.Types.ObjectId,
            ref: 'BugHistory'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Bug', classificationSchema);