/** 
 * The module that defines the event schema in the database through mongoose.
 * @module server/models/event
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents an event in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} name - The name of the event.
 * @property {String} category - The category of the event, can be Education, Health, Livelihood, or Psychosocial.
 * @property {String} status - The status of the event, can be Past, Ongoing, or Upcoming.
 * @property {String} location - The location of the event.
 * @property {Date} startDate - The start date of the event.
 * @property {Date} endDate - The end date of the event, cannot be before the start date.
 * @property {String} mainPhoto - The filename of the main photo of the event.
 */
const eventSchema = new Schema({
    name: {
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    }
});

/* Export the schema. */
module.exports = mongoose.model('Event', eventSchema);