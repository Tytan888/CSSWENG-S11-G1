const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const projectSchema = new Schema({
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
    category: {
        type: String,
        enum: ['Education', 'Health', 'Livelihood', 'Psychosocial'],
        required: true
    },
    state: {
        type: String,
        enum: ['Past', 'Ongoing', 'Completed'],
        required: true
    }
    // TODO: Add a field for all images associated with a project.
});

module.exports = mongoose.model('Project', projectSchema);