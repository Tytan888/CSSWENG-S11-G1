/**
 * This module contains all of the functions aid other controllers in performing
 * operations related to the database. All functions in this module are not routes,
 * but rather are helper functions that return data from the database, particularly 
 * from the project, child, event, newsletter, donation, staff, and trustee schemas.
 * 
 * @module server/controller/utility_controller
 * @requires {@link module:server/models/project}
 * @requires {@link module:server/models/child}
 * @requires {@link module:server/models/event}
 * @requires {@link module:server/models/newsletter}
 * @requires {@link module:server/models/donation}
 * @requires {@link module:server/models/staff}
 * @requires {@link module:server/models/trustee}
 * @requires {@link moment}
 * @requires {@link mongoose}
 */
const Project = require('../models/project.js');
const Child = require('../models/child.js');
const Event = require('../models/event.js');
const Newsletter = require('../models/newsletter.js');
const Donation = require('../models/donation.js');
const Staff = require('../models/staff.js');
const Trustee = require('../models/trustee.js');
const moment = require('moment');
const mongoose = require('mongoose');

/**
 * This object contains helper functions that aid other controllers in performing
 * operations related to the database. All functions in this module are not routes,
 * but rather are helper functions that return data from the database, particularly
 * from the project, child, event, newsletter, donation, staff, and trustee schemas.
 * 
 * @typedef {object} utilityController
 * @memberof module:server/controller/utility_controller
 * @inner
 * 
 * @property {Function} getModel - Returns the model for the given type.
 * @property {Function} getElementById - Returns the element with the given id.
 * @property {Function} getElementsByAmount - Returns the given amount of elements.
 * @property {Function} getElementsByPage - Returns the given page of elements.
 * @property {Function} getElementsByFilters - Returns the elements that match the given filters.
 * @property {Function} getAllElements - Returns all of the elements of the given type.
 * @property {Function} isChildWithSponsor - Returns whether or not the child with the given id has a sponsor.
 */
const Uti = {
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
    getElementById: async function (type, id) {
        /* Retrieve the model for the given type. */
        const model = Uti.getModel(type);
        if (model == null) {
            /* If the model is null, return null. */
            return null;
        }

        /* Check if the id is a valid object id. */
        if (mongoose.isValidObjectId(id)) {
            /* If the id is a valid object id, return the element with the given id. */
            let result = await model.findOne({ _id: id }).lean();

            /* Check if the type is child. */
            if (type == "child") {
                /* If the type is child, calculate the age of the child. */
                result = JSON.parse(JSON.stringify(result));
                result.age = moment().diff(result.birthdate, 'years');
            }

            /* Return the result. */
            return result;
        } else {
            /* If the id is not a valid object id, return null. */
            return null;
        }
    },
    getElementsByAmount: async function (type, amount) {
        /* Retrieve the model for the given type. */
        const model = Uti.getModel(type);

        /* Check if the model is null. */
        if (model == null) {
            /* If the model is null, return null. */
            return null;
        }

        /* Return the given amount of elements. */
        const result = await model.find().sort({ $natural: -1 }).limit(amount).lean();
        return result;
    },
    getElementsByPage: async function (type, page, limit) {
        /* Retrieve the model for the given type. */
        const model = Uti.getModel(type);
        /* Check if the model is null. */
        if (model == null) {
            /* If the model is null, return null. */
            return null;
        }

        let result;
        /* Check if the type is child. */
        if (type == "child") {
            /* If the type is child, filter out the children with sponsors. */
            result = await model.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
            let newResult = [];
            for (let i = 0; i < result.length; i++) {
                const sponsored = await Uti.isChildWithSponsor(result[i]._id);
                if (!sponsored) {
                    newResult.push(result[i]);
                }
            }
            result = newResult;
        } else {
            result = await model.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        }

        /* Check if the type is project or child. */
        if (type == 'project') {
            /* If the type is project, cut off the description if it is too long. */
            const cutoffLength = 140;
            result.forEach(element => {
                if (element.description.length > cutoffLength) {
                    element.description = element.description.substring(0, cutoffLength) + "...";
                }
            });
        } else if (type == 'child') {
            /* If the type is child, calculate the age of the child. */
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
            });
        }

        /* Return the result. */
        return result;
    },
    getElementsByFilters: async function (type, filters, limit) {
        /* Retrieve the model for the given type. */
        const model = Uti.getModel(type);
        /* Check if the model is null. */
        if (model == null) {
            /* If the model is null, return null. */
            return null;
        }

        /* If the limit is null, set it to 100000000. */
        if (limit == null)
            limit = 100000000;

        /* Return the elements that match the given filters. */
        let result = await model.find(filters).sort({ $natural: -1 }).limit(limit).lean();

        /* Check if the type is project or child. */
        if (type == 'project') {
            /* If the type is project, cut off the description if it is too long. */
            const cutoffLength = 140;
            result.forEach(element => {
                if (element.description.length > cutoffLength) {
                    element.description = element.description.substring(0, cutoffLength) + "...";
                }
            });
        } else if (type == 'child') {
            /* If the type is child, calculate the age of the child. */
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
                element.sponsor.time = moment(element.sponsor.time).format('YYYY/MM/DD, hh:mm:ss A');
            });
        }
        return result;
    },
    getAllElements: async function (type) {
        /* Retrieve the model for the given type. */
        const model = Uti.getModel(type);
        /* Check if the model is null. */
        if (model == null) {
            /* If the model is null, return null. */
            return null;
        }

        /* Return all of the elements of the given type. */
        const result = await model.find().sort({ $natural: -1 }).lean();
        if (type == 'child') {
            /* If the type is child, calculate the age of the child. */
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
            });
        }

        /* Return the result. */
        return result;
    },
    isChildWithSponsor: async function (_id) {
        let result = false;
        let id = _id.toString();

        /* Retrieve all of the donations. */
        let donations = await Donation.find({deleted: false}).lean();

        /* Check if the child has a sponsor. */
        donations.forEach(donation => {
            if (donation.donation.attributes.data.attributes.description.startsWith('Initial Sponsorship')) {
                if (donation.donation.attributes.data.attributes.description.includes(id)) {
                    result = true;
                }
            }
        });

        /* Return the result. */
        return result;
    }
};

/* Export the utility controller. */
module.exports = Uti;