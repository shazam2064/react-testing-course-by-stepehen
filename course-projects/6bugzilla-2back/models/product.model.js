const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    classification: {
            type: Schema.Types.ObjectId,
            ref: 'Classification',
            required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    components: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Component'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);