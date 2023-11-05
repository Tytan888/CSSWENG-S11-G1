const Project = require('../models/project.js');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting projects, the old image should be deleted from the database.
const Proj = {
    getProject: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            const result = await Project.findOne({ _id: req.query.id });
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
    getProjectById: async function (id) {
        if (mongoose.isValidObjectId(id)) {
            const result = await Project.findOne({ _id: id });
            return result;
        } else {
            return null;
        }
    },
    getProjectsByAmount: async function (amount) {
        var result = await Project.find().sort({ $natural: -1 }).limit(amount).lean();
        return result;
    },
    getProjectsByPage: async function (page, limit) {
        const cutoffLength = 140;
        var result = await Project.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        result.forEach(element => {
            if (element.description.length > cutoffLength) {
                element.description = element.description.substring(0, cutoffLength) + "...";
            }
        });
        return result;
    },
    getProjectsByFilters: async function (filters, limit) {
        const cutoffLength = 140;
        if (limit == null)
            limit = 100000000;
        var result = await Project.find(filters).sort({ $natural: -1 }).limit(limit).lean();
        result.forEach(element => {
            if (element.description.length > cutoffLength) {
                element.description = element.description.substring(0, cutoffLength) + "...";
            }
        });
        return result;
    },
    addProject: async function (req, res) {
        var newId = new mongoose.mongo.ObjectId();

        const result = await Project.create({ _id: newId, name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateProject: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Project.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.name = resultFind.mainPhoto;

                let result;
                if (req.file == null)
                    result = await Project.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status } })
                else
                    result = await Project.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename } })

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

    deleteProject: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Project.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.name = resultFind.mainPhoto;
                const result = await Project.deleteOne({ _id: req.body.id });
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

module.exports = Proj;