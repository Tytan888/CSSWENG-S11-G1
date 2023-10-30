const Child = require('../models/child.js');
const moment = require('moment');

// TODO: Also for adding, editing, and deleting children, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting children, the old image should be deleted from the database.
const Chi = {
    getChild: async function (req, res) {
        let result = await Child.findOne({ id: req.query.id });
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
    },
    getChildById: async function (req, res, id) {
        let result = await Child.findOne({ id });
        if(result == null)
            return null;
        else{
            result = JSON.parse(JSON.stringify(result));
            result.age = moment().diff(result.birthdate, 'years');
            return result;
        }
    },
    getChildrenByPage: async function (req, res, page, limit) {
        const result = await Child.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        result.forEach(element => {
            element.age = moment().diff(element.birthdate, 'years')
        });
        return result;
    },
    addChild: async function (req, res) {
        let last = await Child.find().sort({ $natural: -1 }).limit(1);
        let newID = 1;
        const suffix = "Child-"
        if (last.length == 1)
            newID = parseInt(last[0].id.substring(suffix.length)) + 1;
        newID = suffix + newID.toString().padStart(7, "0");

        const result = await Child.create({ id: newID, name: req.body.name, birthdate: req.body.birthdate, gradelevel: req.body.gradelevel, location: req.body.location, mainPhoto: req.file.filename })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newID);
        }
    },

    updateChild: async function (req, res, next) {
        const resultFind = await Child.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        } else {
            res.locals.name = resultFind.mainPhoto;

            let result;
            if (req.file == null)
                result = await Child.updateOne({ id: req.body.id }, { $set: { name: req.body.name, gradelevel: req.body.gradelevel, location: req.body.location, birthdate: req.body.birthdate } })
            else
                result = await Child.updateOne({ id: req.body.id }, { $set: { name: req.body.name, gradelevel: req.body.gradelevel, location: req.body.location, birthdate: req.body.birthdate, mainPhoto: req.file.filename } })

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

    deleteChild: async function (req, res, next) {
        const resultFind = await Child.findOne({ id: req.body.id });
        if (resultFind == null) {
            res.status(400);
            res.end();
        }
        else {
            res.locals.name = resultFind.mainPhoto;
            const result = await Child.deleteOne({ id: req.body.id });
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

module.exports = Chi;