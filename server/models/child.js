const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const childSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
    // TODO: Add image.
});

module.exports = mongoose.model('Child', childSchema);