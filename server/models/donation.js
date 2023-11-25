/** 
 * The module that defines the donation schema in the database through mongoose.
 * @module server/models/donation
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a donation in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {Object} donation - The donation object that was sent to the server database from PayMongo through the webhook.
 * @property {Boolean} deleted - Whether or not the donation has been deleted, defaults to false.
 */
const donationSchema = new Schema({
    donation: {
        type: Object,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

/* Export the schema. */
module.exports = mongoose.model('Donation', donationSchema);