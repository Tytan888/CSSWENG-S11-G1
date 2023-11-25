/** 
 * The module that defines the singleton schema in the database through mongoose.
 * @module server/models/singleton
 * @requires {@link mongoose}
 */

/* Import mongoose and define any variables needed to create the schema */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This schema represents a singleton in the database. There should only be one singleton in the database. All of the properties are required.
 * 
 * @type {Schema}
 * 
 * @property {String} id - The id of the singleton, should always be Singleton. This is used to ensure that there is only one singleton in the database.
 * @property {String} aboutUs - The about us description of the organization. Defaults to N/A.
 * @property {String} mission - The mission of the organization. Defaults to N/A.
 * @property {String} vision - The vision of the organization. Defaults to N/A.
 * @property {String} projectsDescription - The description of the projects of the organization. Defaults to N/A.
 * @property {String} newsletterDescription - The description of the newsletter of the organization. Defaults to N/A.
 * @property {String} email - The email address of the organization. Defaults to N/A.
 * @property {String} facebook - The facebook link of the organization. Defaults to N/A.
 * @property {String} instagram - The instagram link of the organization. Defaults to N/A.
 * @property {String} twitter - The twitter link of the organization. Defaults to N/A.
 * @property {String} address - The physical address of the organization. Defaults to N/A.
 * @property {String} phone - The phone number of the organization. Defaults to N/A.
 * @property {String} frontpagePhoto - The filename of the frontpage photo of the organization. Defaults to N/A.
 * @property {String} staffPhoto - The filename of the staff photo of the organization. Defaults to N/A.
 * @property {String} ourFounder - The description of the founder of the organization. Defaults to N/A.
 * @property {String} philippineJourney - The description of the Philippine journey of the organization. Defaults to N/A.
 * @property {String} weBelieve - The description of the beliefs of the organization. Defaults to N/A.
 * @property {String} aboutHealth - The description of the health projects of the organization. Defaults to N/A.
 * @property {String} aboutLivelihood - The description of the livelihood projects of the organization. Defaults to N/A.
 * @property {String} aboutPsychosocial - The description of the psychosocial projects of the organization. Defaults to N/A.
 * @property {String} aboutEducation - The description of the education projects of the organization. Defaults to N/A.
 */
const singletonSchema = new Schema({
    id: {
        type: String,
        enum: ['Singleton'],
        required: true,
        unique: true,
    },
    aboutUs: {
        type: String,
        required: true,
        default: "N/A"
    },
    mission: {
        type: String,
        required: true,
        default: "N/A"
    },
    vision: {
        type: String,
        required: true,
        default: "N/A"
    },
    projectsDescription: {
        type: String,
        required: true,
        default: "N/A"
    },
    newsletterDescription: {
        type: String,
        required: true,
        default: "N/A"
    },
    email:{
        type: String,
        required: true,
        default: "N/A"
    },
    facebook:{
        type: String,
        required: true,
        default: "N/A"
    },
    instagram:{
        type: String,
        required: true,
        default: "N/A"
    },
    twitter:{
        type: String,
        required: true,
        default: "N/A"
    },
    address:{
        type: String,
        required: true,
        default: "N/A"
    },
    phone:{
        type: String,
        required: true,
        default: "N/A"
    },
    frontpagePhoto: {
        type: String,
        required: true,
        default: "N/A"
    },
    staffPhoto: {
        type: String,
        required: true,
        default: "N/A"
    },
    ourFounder: {
        type: String,
        required: true,
        default: "N/A"
    },
    philippineJourney: {
        type: String,
        required: true,
        default: "N/A"
    },
    weBelieve: {
        type: String,
        required: true,
        default: "N/A"
    },
    aboutHealth: {
        type: String,
        required: true,
        default: "N/A"
    },
    aboutLivelihood: {
        type: String,
        required: true,
        default: "N/A"
    },
    aboutPsychosocial: {
        type: String,
        required: true,
        default: "N/A"
    },
    aboutEducation: {
        type: String,
        required: true,
        default: "N/A"
    }
}, { collection: 'singleton' });

/* Export the schema. */
module.exports = mongoose.model('Singleton', singletonSchema);