const Child = require('../models/child.js');
const moment = require('moment');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting children, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting children, the old image should be deleted from the database.
const Chi = {
    getChild: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            let result = await Child.findOne({ _id: req.query.id, sponsor: null });
            if (result == null) {
                res.status(400);
                res.end();
            }
            else {
                result = JSON.parse(JSON.stringify(result));
                result.age = moment().diff(result.birthdate, 'years');
                res.status(200);
                res.json(result);
            }
        } else {
            res.status(400);
            res.end();
        }
    },
    getChildById: async function (id) {
        if (mongoose.isValidObjectId(id)) {
            let result = await Child.findOne({ _id: id, sponsor: null });
            if (result == null)
                return null;
            else {
                result = JSON.parse(JSON.stringify(result));
                result.age = moment().diff(result.birthdate, 'years');
                return result;
            }
        } else {
            return null;
        }
    },
    getChildrenByPage: async function (page, limit) {
        const result = await Child.find({ sponsor: null }).sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        result.forEach(element => {
            element.age = moment().diff(element.birthdate, 'years')
        });
        return result;
    },
    addChild: async function (req, res) {
        var newId = new mongoose.mongo.ObjectId();

        const result = await Child.create({ _id: newId, name: req.body.name, birthdate: req.body.birthdate, gradelevel: req.body.gradelevel, location: req.body.location, mainPhoto: req.file.filename })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },

    updateChild: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Child.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.name = resultFind.mainPhoto;

                let result;
                if (req.file == null)
                    result = await Child.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, gradelevel: req.body.gradelevel, location: req.body.location, birthdate: req.body.birthdate } })
                else
                    result = await Child.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, gradelevel: req.body.gradelevel, location: req.body.location, birthdate: req.body.birthdate, mainPhoto: req.file.filename } })

                console.log(result)
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

    updateSponsor: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            let sponsor = { name: req.body.name, email: req.body.email, phone: req.body.phone };
            result = await Child.updateOne({ _id: req.body.id }, { $set: { sponsor } })
            if (result == null) {
                res.status(400);
                res.end();
            } else {
                res.json("/donate/thanks");
            }
        } else {
            res.status(400);
            res.end();
        }

    },

    deleteChild: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Child.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.name = resultFind.mainPhoto;
                const result = await Child.deleteOne({ _id: req.body.id });
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

module.exports = Chi;