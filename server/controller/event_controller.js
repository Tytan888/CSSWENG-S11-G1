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
    getEvents: async function (req, res, page, limit) {
        const result = await Event.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        return result;
    },
    addEvent: async function (req, res) {
        let last = await Event.find().sort({ $natural: -1 }).limit(1);
        let newID = 1;
        const suffix = "Event-"
        if (last.length == 1)
            newID = parseInt(last[0].id.substring(suffix.length)) + 1;
        newID = suffix + newID.toString().padStart(7, "0");
        let photos = [];
        req.files.forEach(element => {
            photos.push(element.filename);
        });
        const result = await Event.create({ id: newID, name: req.body.name, photos })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newID);
        }
    },
    //TODO BELOW
    updateEvent: async function (req, res, next) {
        const resultFind = await Event.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        } else {
            res.locals.names = resultFind.photos;
            let result;
            if (req.files == null)
                result = await Event.updateOne({ id: req.body.id }, { $set: { name: req.body.name } })
            else {
                let photos = [];
                req.files.forEach(element => {
                    photos.push(element.filename);
                });
                
                result = await Event.updateOne({ id: req.body.id }, { $set: { name: req.body.name, photos } })
            }
            if (result == null) {
                res.status(400);
                res.end();
            } else {
                if (req.files != null) {
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
            res.locals.names = resultFind.photos;
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