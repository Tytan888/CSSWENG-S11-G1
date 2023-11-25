/** 
 * The module that defines the project schema in the database through mongoose.
 * @module server/models/project
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a project in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} name - The name of the project.
 * @property {String} description - The description of the project.
 * @property {String} category - The category of the project, can be Education, Health, Livelihood, or Psychosocial.
 * @property {String} status - The status of the project, can be Past, Ongoing, or Upcoming.
 * @property {String} location - The location of the project.
 * @property {Number} raisedDonations - The amount of money raised for the project, cannot be negative.
 * @property {Number} requiredBudget - The amount of money required for the project, cannot be negative.
 * @property {String} mainPhoto - The filename of the main photo of the project.
 */
const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Education', 'Health', 'Livelihood', 'Psychosocial'],
        required: true
    },
    status: {
        type: String,
        enum: ['Past', 'Ongoing', 'Upcoming'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    raisedDonations: {
        type: Number,
        required: true
    },
    requiredBudget: {
        type: Number,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    }
});

/* Export the schema. */
module.exports = mongoose.model('Project', projectSchema);