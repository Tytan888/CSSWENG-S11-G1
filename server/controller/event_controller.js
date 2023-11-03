const Event = require('../models/event.js');

// TODO: Also for adding, editing, and deleting events, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting events, the old image should be deleted from the database.
const Eve = {
    getEvent: async function (req, res) {
        const result = await Event.findOne({ id: req.query.id });
        if (result == null) {
            res.status(400);
            res.end();
        }
        else {
            res.status(200);
            res.json(result);
        }
    },
    getEventById: async function (id) {
        const result = await Event.findOne({ id });
        return result;
    },
    getEventsByFilters: async function (filters, limit) {
        if (limit == null)
            limit = 100000000;
        var result = await Event.find(filters).sort({ $natural: -1 }).limit(limit).lean();
        return result;
    },
    addEvent: async function (req, res) {
        let last = await Event.find().sort({ $natural: -1 }).limit(1);
        let newID = 1;
        const suffix = "Event-"
        if (last.length == 1)
            newID = parseInt(last[0].id.substring(suffix.length)) + 1;
        newID = suffix + newID.toString().padStart(7, "0");

        const result = await Event.create({ id: newID, name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate, mainPhoto: req.file.filename })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newID);
        }
    },
    updateEvent: async function (req, res, next) {
        const resultFind = await Event.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        } else {
            res.locals.name = resultFind.mainPhoto;

            let result;
            if (req.file == null)
                result = await Event.updateOne({ id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate } })
            else
                result = await Event.updateOne({ id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, location: req.body.location, startDate: req.body.startdate, endDate: req.body.enddate, mainPhoto: req.file.filename } })

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
    },

    deleteEvent: async function (req, res, next) {
        const resultFind = await Event.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        }
        else {
            res.locals.name = resultFind.mainPhoto;
            const result = await Event.deleteOne({ id: req.body.id });
            if (result == null) {
                res.status(400);
                res.end();
            }
            else {
                next();
            }
        }
    },
};

module.exports = Eve;