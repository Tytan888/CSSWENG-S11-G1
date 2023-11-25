
/**
 * The module that defines the admin schema in the database through mongoose.
 * @module server/models/admin
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents an admin in the database. All of the properties are required. 
 * @type {Schema}
 * 
 * @property {String} username - The username of the admin.
 * @property {String} passwordHash - The hashed password of the admin.
 */
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash:{
        type: String,
        required: true
    }
});

/* Export the schema. */
module.exports = mongoose.model('Admin', adminSchema);