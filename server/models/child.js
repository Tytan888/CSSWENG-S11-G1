
/**
 * The module that defines the child schema in the database through mongoose.
 * @module server/models/child
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a child in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} name - The name of the child.
 * @property {String} description - The description of the child.
 * @property {String} gradelevel - The grade level of the child.
 * @property {Date} birthdate - The birthdate of the child.
 * @property {String} location - The location of the child.
 * @property {String} mainPhoto - The filename of the main photo of the child.
 */
const childSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required : true
    },
    gradelevel: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    mainPhoto: {
        type: String,
        required: true
    }
});

/* Export the schema. */
module.exports = mongoose.model('Child', childSchema);