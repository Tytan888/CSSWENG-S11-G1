const Trustee = require('../models/trustee.js');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting trustees, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting trustees, the old image should be deleted from the database.
const Trus = {
    getTrustee: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            const result = await Trustee.findOne({ _id: req.query.id });
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
    getAllTrustees: async function () {
        const result = await Trustee.find().sort({ $natural: -1 }).lean();
        return result;
    },
    addTrustee: async function (req, res) {
        var newId = new mongoose.mongo.ObjectId();

        const result = await Trustee.create({ _id: newId, name: req.body.name, position: req.body.position })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateTrustee: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Trustee.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.name = resultFind.mainPhoto;

                let result;
                if (req.file == null)
                    result = await Trustee.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, position: req.body.position } })
                

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

    deleteTrustee: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Trustee.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.name = resultFind.mainPhoto;
                const result = await Trustee.deleteOne({ _id: req.body.id });
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

module.exports = Trus;