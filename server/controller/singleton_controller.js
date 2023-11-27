/**
 * This module contains all of the functions that are used to handle requests
 * and operations related to the singleton schema.
 * @module server/controller/singleton_controller
 * 
 * @requires {@link module:server/models/singleton}
 */
const Singleton = require('../models/singleton.js');

/**
 * This object contains all of the functions that are used to handle requests
 * and operations related to the singleton schema.
 * 
 * @typedef {object} singletonController
 * @memberof module:server/controller/singleton_controller
 * @inner
 *  
 * @property {Function} initializeSingleton - Initializes the singleton if it does not exist.
 * @property {Function} getOthers - Handles GET requests to retrieve the fields for Edit Others page.
 * @property {Function} updateOthers - Handles PUT requests to update the fields for Edit Others page.
 * @property {Function} getIndex - Retrieves the fields for the index page.
 * @property {Function} getFooter - Retrieves the fields for the footer.
 * @property {Function} getAbout - Retrieves the fields for the about us page.
 * @property {Function} getStaffPhoto - Retrieves the staff photo.
 * @property {Function} updateStaffPhoto - Handles PUT requests to update the staff photo.
 */
const Sing = {
    initializeSingleton: async function () {
        /* Check if the singleton exists. */
        if (await Singleton.findOne({ id: "Singleton" }) == null)
            /* If the singleton does not exist, create it. */
            await Singleton.create({ id: "Singleton" });
    },
    getOthers: async function (req, res) {
        /* Retrieve the fields for the Edit Others page. */
        const result = await Singleton.findOne({ id: "Singleton" });
        delete result.staffPhoto;

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, return a 400 error. */
            res.status(400);
            res.end();
        } else {
            /* If the result is not null, return the result. */
            res.status(200);
            res.json(result);
        }
    },
    updateOthers: async function (req, res, next) {
        /* Retrieve the previous frontpage photo. */
        const resultFind = await Singleton.findOne({ id: "Singleton" });
        res.locals.name = resultFind.frontpagePhoto;

        /* Update the fields for the Edit Others page. */
        let update = req.body;
        /* Check if the request contains a file. */
        if (req.file != null) {
            /* If the request contains a file, set the frontpage photo to the filename of the file. */
            update.frontpagePhoto = req.file.filename;
        }

        /* Update the singleton in the database. */
        const result = await Singleton.updateOne({ id: "Singleton" }, { $set: update });

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, return a 400 error. */
            res.status(400);
            res.end();
        } else {
            /* If the result is not null, check if the previous frontpage photo is not the default photo. */
            if (req.file != null && res.locals.name != "N/A") {
                /* If the previous frontpage photo is not the default photo and the request contains a file, delete the previous frontpage photo. */
                next();
            }
            else {
                /* If the previous frontpage photo is the default photo or the request does not contain a file, return a 200 status code. */
                res.end()
                res.status(200);
            }
        }
    },
    getIndex: async function () {
        /* Retrieve the fields for the index page. */
        const result = await Singleton.findOne({ id: "Singleton" });

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, initialize the singleton and return the fields for the index page. */
            await this.initializeSingleton();
            return this.getIndex();
        }
        else {
            /* If the result is not null, return the fields for the index page. */
            return { aboutUs: result.aboutUs, mission: result.mission, vision: result.vision, projectsDescription: result.projectsDescription, newsletterDescription: result.newsletterDescription, frontpagePhoto: result.frontpagePhoto };
        }
    },
    getFooter: async function () {
        /* Retrieve the fields for the footer. */
        const result = await Singleton.findOne({ id: "Singleton" });

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, initialize the singleton and return the fields for the footer. */
            await this.initializeSingleton();
            return this.getFooter();
        }
        else {
            /* If the result is not null, return the fields for the footer. */
            return { email: result.email, facebook: result.facebook, instagram: result.instagram, twitter: result.twitter, address: result.address, phone: result.phone, aboutUs: result.aboutUs };
        }
    },
    getAbout: async function () {
        /* Retrieve the fields for the about us page. */
        const result = await Singleton.findOne({ id: "Singleton" });

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, initialize the singleton and return the fields for the about us page. */
            await this.initializeSingleton();
            return this.getAbout();
        }
        else {
            /* If the result is not null, return the fields for the about us page. */
            return { ourFounder: result.ourFounder, philippineJourney: result.philippineJourney, weBelieve: result.weBelieve, aboutHealth: result.aboutHealth, aboutLivelihood: result.aboutLivelihood, aboutPsychosocial: result.aboutPsychosocial, aboutEducation: result.aboutEducation };
        }

    },
    getStaffPhoto: async function (req, res) {
        /* Retrieve the staff photo. */
        const result = await Singleton.findOne({ id: "Singleton" });

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, return a 400 error. */
            res.status(400);
            res.end();
        }
        else {
            /* If the previous staff photo is the default photo, return a 200 status code. */
            res.json({staffPhoto: result.staffPhoto});
            res.status(200);
        }
    },
    updateStaffPhoto: async function (req, res, next) {
        /* Retrieve the previous staff photo. */
        const resultFind = await Singleton.findOne({ id: "Singleton" });
        res.locals.name = resultFind.staffPhoto;

        /* Update the staff photo. */
        let result = await Singleton.updateOne({ id: "Singleton" }, { $set: { staffPhoto: req.file.filename } })

        /* Check if the result is null. */
        if (result == null) {
            /* If the result is null, return a 400 error. */
            res.status(400);
            res.end();
        } else {
            /* If the result is not null, check if the previous staff photo is not the default photo. */
            if (res.locals.name != "N/A") {
                /* If the previous staff photo is not the default photo, delete the previous staff photo. */
                next();
            }
            else {
                /* If the previous staff photo is the default photo, return a 200 status code. */
                res.end()
                res.status(200);
            }
        }
    }
};

/* Export the singletonController object. */
module.exports = Sing;