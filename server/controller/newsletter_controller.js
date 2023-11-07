const Newsletter = require('../models/newsletter.js');
const mongoose = require('mongoose');

// TODO: Also for adding, editing, and deleting Newsletters, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting Newsletters, the old image should be deleted from the database.
const News = {
    getNewsletter: async function (req, res) {
        if (mongoose.isValidObjectId(req.query.id)) {
            const result = await Newsletter.findOne({ _id: req.query.id });
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
    getNewsletterById: async function (id) {
        if (mongoose.isValidObjectId(id)) {
            const result = await Newsletter.findOne({ _id: id });
            return result;
        } else {
            return null;
        }
    },
    getNewslettersByFilters: async function (filters, limit) {
        if (limit == null)
            limit = 100000000;
        var result = await Newsletter.find(filters).sort({ $natural: -1 }).limit(limit).lean();
        return result;
    },
    getNewslettersByAmount: async function (amount) {
        var result = await Newsletter.find().sort({ $natural: -1 }).limit(amount).lean();
        return result;
    },
    getAllNewsletters: async function () {
        const result = await Newsletter.find().sort({ $natural: -1 }).lean();
        return result;
    },
    addNewsletter: async function (req, res) {
        console.log(req.body)
        var newId = new mongoose.mongo.ObjectId();

        let photos = [];
        req.files.forEach(element => {
            photos.push(element.filename);
        });
        const result = await Newsletter.create({ _id: newId, name: req.body.name, category: req.body.category, status: req.body.status, photos })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateNewsletter: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Newsletter.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {
                res.locals.names = resultFind.photos;
                let result;
                if (req.files.length == 0)
                    result = await Newsletter.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, } })
                else {
                    let photos = [];
                    req.files.forEach(element => {
                        photos.push(element.filename);
                    });

                    result = await Newsletter.updateOne({ _id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, photos } })
                }
                if (result == null) {
                    res.status(400);
                    res.end();
                } else {
                    if (req.files.length != 0) {
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

    deleteNewsletter: async function (req, res, next) {
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await Newsletter.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                res.locals.names = resultFind.photos;
                const result = await Newsletter.deleteOne({ _id: req.body.id });
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

module.exports = News;