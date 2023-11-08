const Event = require('../models/event.js');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting events, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting events, the old image should be deleted from the database.
const Eve = {
    getEvent: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            const result = await Event.findOne({ _id: req.query.id });
            if (result == null) {
                res.status(400);
                res.end();
            }
            else {
                res.status(200);
                res.json(result);
            }
        } else {
            res.status(400);
            res.end();
        }
    },
    getEventById: async function (id) {
        if (mongoose.isValidObjectId(id)) {
            const result = await Event.findOne({ _id: id });
            return result;
        } else {
            return null;
        }
    },
    getEventsByFilters: async function (filters, limit) {
        if (limit == null)
            limit = 100000000;
        var result = await Event.find(filters).sort({ $natural: -1 }).limit(limit).lean();
        return result;
    },
    getAllEvents: async function () {
        const result = await Event.find().sort({ $natural: -1 }).lean();
        return result;
    },
    addEvent: async function (req, res) {
        var newId = new mongoose.mongo.ObjectId();

        const result = await Event.create({ _id: newId, name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate, mainPhoto: req.file.filename })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateEvent: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Event.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.name = resultFind.mainPhoto;

                let result;
                if (req.file == null)
                    result = await Event.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate } })
                else
                    result = await Event.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate, mainPhoto: req.file.filename } })

                if (result == null) {
                    res.status(400);
                    res.end();
                } else {
                    if (req.file != null) {
                        res.locals.id = req.body.id;
                        next();
                    }
                    else
                        res.json(req.body.id);
                }
            }
        } else {
            res.status(400);
            res.end();
        }
    },

    deleteEvent: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Event.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.name = resultFind.mainPhoto;
                const result = await Event.deleteOne({ _id: req.body.id });
                if (result == null) {
                    res.status(400);
                    res.end();
                }
                else {
                    next();
                }
            }
        } else {
            res.status(400);
            res.end();
        }
    },
};

module.exports = Eve;