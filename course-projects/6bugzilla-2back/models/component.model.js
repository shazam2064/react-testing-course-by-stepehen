const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const componentSchema = new Schema({
    product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignee: {
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    CC: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    bugs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Bug'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Component', componentSchema);