const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    author: {
        type: String,
        required: true
    },
    // TODO: Add a field for all images associated with an event.
    image: {
        type: String,
        required: false
    },
});

module.exports = mongoose.model('Event', eventSchema);