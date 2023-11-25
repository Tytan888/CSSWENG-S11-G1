/** 
 * The module that defines the newsletter schema in the database through mongoose.
 * @module server/models/newsletter
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a newsletter in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} name - The name of the newsletter.
 * @property {String} category - The category of the newsletter, can be Education, Health, Livelihood, or Psychosocial.
 * @property {String} status - The status of the newsletter, can be Past, Ongoing, or Upcoming.
 * @property {String[]} photos - The filenames of the photos of the newsletter.
 */
const newsletterSchema = new Schema({
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
    photos: {
        type: [String],
        validate: v => Array.isArray(v) && v.length > 0,
    }
});

/* Export the schema. */
module.exports = mongoose.model('Newsletter', newsletterSchema);