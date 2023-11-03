const Newsletter = require('../models/newsletter.js');

// TODO: Also for adding, editing, and deleting Newsletters, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting Newsletters, the old image should be deleted from the database.
const News = {
    getNewsletter: async function (req, res) {
        const result = await Newsletter.findOne({ id: req.query.id });
        if (result == null) {
            res.status(400);
            res.end();
        }
        else {
            res.status(200);
            res.json(result);
        }
    },
    getNewsletterById: async function (id) {
        const result = await Newsletter.findOne({ id });
        return result;
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
    addNewsletter: async function (req, res) {
        let last = await Newsletter.find().sort({ $natural: -1 }).limit(1);
        let newID = 1;
        const suffix = "Newsletter-"
        if (last.length == 1)
            newID = parseInt(last[0].id.substring(suffix.length)) + 1;
        newID = suffix + newID.toString().padStart(7, "0");
        let photos = [];
        req.files.forEach(element => {
            photos.push(element.filename);
        });
        const result = await Newsletter.create({ id: newID, name: req.body.name, category: req.body.category, status: req.body.status, photos })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newID);
        }
    },
    updateNewsletter: async function (req, res, next) {
        const resultFind = await Newsletter.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        } else {
            res.locals.names = resultFind.photos;
            let result;
            if (req.files == null)
                result = await Newsletter.updateOne({ id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, } })
            else {
                let photos = [];
                req.files.forEach(element => {
                    photos.push(element.filename);
                });

                result = await Newsletter.updateOne({ id: req.body.id }, { $set: { name: req.body.name, category: req.body.category, status: req.body.status, photos } })
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

    deleteNewsletter: async function (req, res, next) {
        const resultFind = await Newsletter.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        }
        else {
            res.locals.names = resultFind.photos;
            const result = await Newsletter.deleteOne({ id: req.body.id });
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

module.exports = News;