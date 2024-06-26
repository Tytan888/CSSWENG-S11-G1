/**
 * This module contains all of the functions that handle GET, POST, PUT, and DELETE route requests
 * involving the project, child, event, newsletter, staff, and trustee models.
 * 
 * @module server/controller/request_controller
 * 
 * @requires {@link module:server/models/project}
 * @requires {@link module:server/models/child}
 * @requires {@link module:server/models/event}
 * @requires {@link module:server/models/newsletter}
 * @requires {@link module:server/models/staff}
 * @requires {@link module:server/models/trustee}
 * @requires {@link module:server/controller/utility_controller}
 * @requires {@link module:server/controller/singleton_controller}
 * @requires {@link moment}
 * @requires {@link mongoose}
*/
const Project = require('../models/project.js');
const Child = require('../models/child.js');
const Event = require('../models/event.js');
const Newsletter = require('../models/newsletter.js');
const Staff = require('../models/staff.js');
const Trustee = require('../models/trustee.js');
const moment = require('moment');
const mongoose = require('mongoose');

/**
 * This object to be exported contains all of the functions that are used to handle GET, POST, PUT, 
 * and DELETE route requests involving the project, child, event, newsletter, staff, and trustee models.
 * 
 * @typedef {object} requestController
 * @memberof module:server/controller/request_controller
 * @inner
 * 
 * @property {Function} getModel - Returns the model based on the type of element.
 * @property {Function} getElement - Handles GET requests to retrieve an element from the database.
 * @property {Function} addElement - Handles POST requests to add an element to the database.
 * @property {Function} updateElement - Handles PUT requests to update an element in the database.
 * @property {Function} updateSponsor - Handles PUT requests to update the sponsor of a child in the database.
 * @property {Function} deleteElement - Handles DELETE requests to delete an element from the database.
*/
const Req = {
    getModel: function (type) {
        /* Return the model based on the type of element. */
        let model;
        switch (type) {
            case "project":
                model = Project;
                break;
            case "child":
                model = Child;
                break;
            case "event":
                model = Event;
                break;
            case "newsletter":
                model = Newsletter;
                break;
            case "staff":
                model = Staff;
                break;
            case "trustee":
                model = Trustee;
                break;
            default:
                return null;
        }
        return model;
    },

    getElement: async function (req, res) {

        /* Extract the type of element from the route parameters. */
        const type = req.params.type;
        /* Retrieve the model based on the type of element. */
        const model = Req.getModel(type);

        /* Check if the model exists. */
        if (model == null) {
            /* If the model does not exist, return a 400 error. */
            res.status(400);
            res.end();
            return;
        }

        /* Check if the id is valid. */
        if (mongoose.isValidObjectId(req.query.id)) {
            /* If the id is valid, retrieve the element with the given id from the database. */
            let result = await model.findOne({ _id: req.query.id });
            if (result == null) {
                /* If the element does not exist, return a 400 error. */
                res.status(400);
                res.end();
            }
            else {
                /* If the element exists, return the element. */

                if (type == "child") {
                    /* If the element is a child, calculate the age of the child. */
                    result = JSON.parse(JSON.stringify(result));
                    result.age = moment().diff(result.birthdate, 'years');
                }

                /* Return the element. */
                res.status(200);
                res.json(result);
            }
        } else {
            /* If the id is invalid, return a 400 error. */
            res.status(400);
            res.end();
        }
    },
    addElement: async function (req, res) {

        /* Extract the type of element from the route parameters. */
        const type = req.params.type;
        /* Retrieve the model based on the type of element. */
        const model = Req.getModel(type);

        /* Check if the model exists. */
        if (model == null) {
            /* If the model does not exist, return a 400 error. */
            res.status(400);
            res.end();
            return;
        }

        /* Create a new id for the element. */
        let newId = new mongoose.mongo.ObjectId();

        /* Build the element to be added to the database. */
        let create = { ...{ _id: newId }, ...req.body };
        switch (type) {
            case "project":
            case "child":
            case "event":
                /* If the element is a project, child, or event, add the main photo of the element to the element. */
                create = { ...create, ...{ mainPhoto: req.file.filename } };
                break;
            case "newsletter":
                /* If the element is a newsletter, add the photos of the element to the element. */
                let photos = [];
                req.files.forEach(element => {
                    photos.push(element.filename);
                });
                create = { ...create, ...{ photos } };
                break;
        }

        /* Add the element to the database. */
        const result = await model.create(create);

        /* Check if the element was added to the database. */
        if (result == null) {
            /* If the element was not added to the database, return a 400 error. */
            res.status(400);
            res.end();
        } else {
            /* If the element was added to the database, return the id of the element. */
            res.status(200);
            res.json(newId);
        }
    },
    updateElement: async function (req, res, next) {
        /* Extract the type of element from the route parameters. */
        const type = req.params.type;
        /* Retrieve the model based on the type of element. */
        const model = Req.getModel(type);

        /* Check if the model exists. */
        if (model == null) {
            /* If the model does not exist, return a 400 error. */
            res.status(400);
            res.end();
            return;
        }

        /* Check if the id is valid. */
        if (mongoose.isValidObjectId(req.body.id)) {
            /* If the id is valid, retrieve the element with the given id from the database. */
            const resultFind = await model.findOne({ _id: req.body.id });

            /* Check if the element exists. */
            if (resultFind == null) {
                /* If the element does not exist, return a 400 error. */
                res.status(400);
                res.end();
            } else {
                /* If the element exists, update the element in the database. */
                let update = req.body;
                switch (type) {
                    case "project":
                    case "child":
                    case "event":
                        /* If the element is a project, child, or event, update the main photo of the element in the database
                        if the main photo of the element was changed. */
                        res.locals.name = resultFind.mainPhoto;
                        if (req.file != null)
                            update.mainPhoto = req.file.filename;
                        break;
                    case "newsletter":
                        /* If the element is a newsletter, update the photos of the element in the database
                        if the photos of the element were changed. */
                        res.locals.names = resultFind.photos;
                        if (req.files.length != 0) {
                            let photos = [];
                            req.files.forEach(element => {
                                photos.push(element.filename);
                            });
                            update.photos = photos;
                        }
                        break;
                }

                /* Change id to _id to match the mongoose database. */
                const _id = update.id;
                delete update.id;

                /* Update the element in the database. */
                let result = await model.updateOne({ _id }, { $set: update })

                /* Check if the element was updated in the database. */
                if (result == null) {
                    /* If the element was not updated in the database, return a 400 error. */
                    res.status(400);
                    res.end();
                } else {
                    /* If the element was updated in the database, return the id of the element. */
                    if (type == "newsletter") {
                        /* If the element is a newsletter, check if the photos of the element were changed. */
                        if (req.files.length != 0) {
                            /* If the photos of the element were changed, call the next function to delete the old photos. */
                            res.locals.id = req.body.id;
                            next();
                            return;
                        } else {
                            /* If the photos of the element were not changed, return the id of the element. */
                            res.json(req.body.id);
                            return;
                        }
                    }
                    /* If the element is a project, child, or event, check if the main photo of the element was changed. */
                    else if (req.file != null) {
                        /* If the main photo of the element was changed, call the next function to delete the old main photo. */
                        res.locals.id = req.body.id;
                        next();
                    }
                    else {
                        /* If the main photo of the element was not changed, return the id of the element. */
                        res.json(req.body.id);
                    }
                }
            }
        } else {
            /* If the id is invalid, return a 400 error. */
            res.status(400);
            res.end();
        }
    },
    deleteElement: async function (req, res, next) {
        /* Extract the type of element from the route parameters. */
        const type = req.params.type;
        /* Retrieve the model based on the type of element. */
        const model = Req.getModel(type);

        /* Check if the model exists. */
        if (model == null) {
            /* If the model does not exist, return a 400 error. */
            res.status(400);
            res.end();
            return;
        }

        /* Check if the id is valid. */
        if (mongoose.isValidObjectId(req.body.id)) {
            /* If the id is valid, retrieve the element with the given id from the database. */
            const resultFind = await model.findOne({ _id: req.body.id });

            /* Check if the element exists. */
            if (resultFind == null) {
                /* If the element does not exist, return a 400 error. */
                res.status(400);
                res.end();
            }
            else {
                /* If the element exists, delete the element from the database. */
                switch (type) {
                    case "project":
                    case "child":
                    case "event":
                        /* If the element is a project, child, or event, delete the main photo of the element from the database. */
                        res.locals.name = resultFind.mainPhoto;
                        break;
                    case "newsletter":
                        /* If the element is a newsletter, delete the photos of the element from the database. */
                        res.locals.names = resultFind.photos;
                        break;
                }

                /* Delete the element from the database. */
                const result = await model.deleteOne({ _id: req.body.id });

                /* Check if the element was deleted from the database. */
                if (result == null) {
                    /* If the element was not deleted from the database, return a 400 error. */
                    res.status(400);
                    res.end();
                }
                else {
                    /* If the element was deleted from the database... */
                    switch (type) {
                        case "project":
                        case "child":
                        case "event":
                        case "newsletter":
                            /* If the element is a project, child, event, or newsletter, call the next function to delete the photos of the element. */
                            next();
                            break;
                        default:
                            /* Otherwise, return the id of the element. */
                            res.end();
                            res.status(200);
                            break;
                    }
                }
            }
        } else {
            /* If the id is invalid, return a 400 error. */
            res.status(400);
            res.end();
        }
    }
};

/* Export the module. */
module.exports = Req;