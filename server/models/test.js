const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const testSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    code:{
        type: String,
        required: true,
    }
    // TODO: Add a field for all images associated with a project.
});

module.exports = mongoose.model('Test', testSchema);