const Staff = require('../models/staff.js');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting staffs, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting staffs, the old image should be deleted from the database.
const Staf = {
    getStaff: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            const result = await Staff.findOne({ _id: req.query.id });
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
    getAllStaffs: async function () {
        const result = await Staff.find().sort({ $natural: -1 }).lean();
        return result;
    },
    addStaff: async function (req, res) {
        var newId = new mongoose.mongo.ObjectId();

        const result = await Staff.create({ _id: newId, name: req.body.name, position: req.body.position })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateStaff: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Staff.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.name = resultFind.mainPhoto;

                let result;
                if (req.file == null)
                    result = await Staff.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, position: req.body.position } })
                

                if (result == null) {
                    res.status(400);
                    res.end();
                } else {
                    res.json(req.body.id);
                }
            }
        } else {
            res.status(400);
            res.end();
        }
    },

    deleteStaff: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Staff.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.name = resultFind.mainPhoto;
                const result = await Staff.deleteOne({ _id: req.body.id });
                if (result == null) {
                    res.status(400);
                    res.end();
                }
                else {
                    res.status(200);
                    res.end();
                }
            }
        } else {
            res.status(400);
            res.end();
        }
    },
};

module.exports = Staf;