/** 
 * The module that defines the trustee schema in the database through mongoose.
 * @module server/models/trustee
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a trustee in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} name - The name of the trustee.
 * @property {String} position - The position of the trustee.
 */
const trusteeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    }
});

/* Export the schema. */
module.exports = mongoose.model('Trustee', trusteeSchema);