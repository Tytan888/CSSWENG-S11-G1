const Project = require('../models/project.js');
const Child = require('../models/child.js');
const Event = require('../models/event.js');
const Newsletter = require('../models/newsletter.js');
const Donation = require('../models/donation.js');
const Staff = require('../models/staff.js');
const Trustee = require('../models/trustee.js');
const moment = require('moment');
const mongoose = require('mongoose');

const Uti = {
    getModel: function (type) {
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
        const model = Uti.getModel(type);
        if (model == null) {
            return null;
        }
        if (mongoose.isValidObjectId(id)) {
            let result = await model.findOne({ _id: id }).lean();
            if (type == "child") {
                result = JSON.parse(JSON.stringify(result));
                result.age = moment().diff(result.birthdate, 'years');
            }
            return result;
        } else {
            return null;
        }
    },
    getElementsByAmount: async function (type, amount) {
        const model = Uti.getModel(type);
        if (model == null) {
            return null;
        }
        const result = await model.find().sort({ $natural: -1 }).limit(amount).lean();
        return result;
    },
    getElementsByPage: async function (type, page, limit) {
        const model = Uti.getModel(type);
        if (model == null) {
            return null;
        }
        let result;
        if (type == "child") {
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
        if (type == 'project') {
            const cutoffLength = 140;
            result.forEach(element => {
                if (element.description.length > cutoffLength) {
                    element.description = element.description.substring(0, cutoffLength) + "...";
                }
            });
        } else if (type == 'child') {
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
            });
        }
        return result;
    },
    getElementsByFilters: async function (type, filters, limit) {
        const model = Uti.getModel(type);
        if (model == null) {
            return null;
        }
        if (limit == null)
            limit = 100000000;
        let result = await model.find(filters).sort({ $natural: -1 }).limit(limit).lean();
        if (type == 'project') {
            const cutoffLength = 140;
            result.forEach(element => {
                if (element.description.length > cutoffLength) {
                    element.description = element.description.substring(0, cutoffLength) + "...";
                }
            });
        } else if (type == 'child') {
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
                element.sponsor.time = moment(element.sponsor.time).format('YYYY/MM/DD, hh:mm:ss A');
            });
        }
        return result;
    },
    getAllElements: async function (type) {
        const model = Uti.getModel(type);
        if (model == null) {
            return null;
        }
        const result = await model.find().sort({ $natural: -1 }).lean();
        if (type == 'child') {
            result.forEach(element => {
                element.age = moment().diff(element.birthdate, 'years')
            });
        }
        return result;
    },
    isChildWithSponsor: async function (_id) {
        let result = false;
        let id = _id.toString();
        let donations = await Donation.find({deleted: false}).lean();
        donations.forEach(donation => {
            if (donation.donation.attributes.data.attributes.description.startsWith('Initial Sponsorship')) {
                if (donation.donation.attributes.data.attributes.description.includes(id)) {
                    result = true;
                }
            }
        });
        return result;
    }
};

module.exports = Uti;