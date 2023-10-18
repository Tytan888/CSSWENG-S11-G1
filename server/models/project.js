const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const projectSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Education', 'Health', 'Livelihood', 'Psychosocial'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    raisedDonations:{
        type: Number,
        required: true
    },
    requiredBudget:{
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Past', 'Ongoing', 'Upcoming'],
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Project', projectSchema);