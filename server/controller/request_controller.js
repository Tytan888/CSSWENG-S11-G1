const Project = require('../models/project.js');
const Child = require('../models/child.js');
const Event = require('../models/event.js');
const Newsletter = require('../models/newsletter.js');
const Singleton = require('../models/singleton.js');
const Staff = require('../models/staff.js');
const Trustee = require('../models/trustee.js');
const moment = require('moment');
const mongoose = require('mongoose');

const Req = {
    getModel: function (type) {
        let model;
        switch (type) {
            case "project":
                model = Project;
                break;
            case "child":
                model = Child;
                break;
            case "event":
                model = Event;
                break;
            case "newsletter":
                model = Newsletter;
                break;
            case "staff":
                model = Staff;
                break;
            case "trustee":
                model = Trustee;
                break;
            default:
                return null;
        }
        return model;
    },

    getElement: async function (req, res) {
        const type = req.params.type;
        const model = Req.getModel(type);
        if (model == null) {
            res.status(400);
            res.end();
            return;
        }
        if (mongoose.isValidObjectId(req.query.id)) {
            let result = await model.findOne({ _id: req.query.id });
            if (result == null) {
                res.status(400);
                res.end();
            }
            else {
                if (type == "child") {
                    result = JSON.parse(JSON.stringify(result));
                    result.age = moment().diff(result.birthdate, 'years');
                }
                res.status(200);
                res.json(result);
            }
        } else {
            res.status(400);
            res.end();
        }
    },
    addElement: async function (req, res) {
        const type = req.params.type;
        const model = Req.getModel(type);
        if (model == null) {
            res.status(400);
            res.end();
            return;
        }

        let newId = new mongoose.mongo.ObjectId();
        let create = { ...{ _id: newId }, ...req.body };
        switch (type) {
            case "project":
            case "child":
            case "event":
                create = { ...create, ...{ mainPhoto: req.file.filename } };
                break;
        }

        const result = await model.create(create);

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    addNewsletter: async function (req, res) {
        let newId = new mongoose.mongo.ObjectId();
        let create = { ...{ _id: newId }, ...req.body };
        let photos = [];
        req.files.forEach(element => {
            photos.push(element.filename);
        });
        create = { ...create, ...{ photos } };
        const result = await Newsletter.create(create);

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(newId);
        }
    },
    updateElement: async function (req, res, next) {
        const type = req.params.type;
        const model = Req.getModel(type);
        if (model == null) {
            res.status(400);
            res.end();
            return;
        }
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await model.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            } else {

                let update = req.body;
                switch (type) {
                    case "project":
                    case "child":
                    case "event":
                        res.locals.name = resultFind.mainPhoto;
                        if (req.file != null)
                            update.mainPhoto = req.file.filename;
                        break;
                }
                const _id = update.id;
                delete update.id;

                let result = await model.updateOne({ _id }, { $set: update })

                if (result == null) {
                    res.status(400);
                    res.end();
                } else {
                    if (req.file != null) {
                        res.locals.id = req.body.id;
                        next();
                    }
                    else {
                        res.json(req.body.id);
                    }
                }
            }
        } else {
            res.status(400);
            res.end();
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
                let update = req.body;
                if (req.files.length != 0) {
                    let photos = [];
                    req.files.forEach(element => {
                        photos.push(element.filename);
                    });
                    update.photos = photos;
                }
                const _id = update.id;
                delete update.id;
                const result = await Newsletter.updateOne({ _id }, { $set: update })

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
    updateSponsor: async function (req, res) {
        if (mongoose.isValidObjectId(req.body.id)) {
            let sponsor = { name: req.body.name, email: req.body.email, phone: req.body.phone, time: new Date() };
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
    deleteElement: async function (req, res, next) {
        const type = req.params.type;
        const model = Req.getModel(type);
        if (model == null) {
            res.status(400);
            res.end();
            return;
        }
        if (mongoose.isValidObjectId(req.body.id)) {
            const resultFind = await model.findOne({ _id: req.body.id });
            if (resultFind == null) {
                res.status(400);
                res.end();
            }
            else {
                switch (type) {
                    case "project":
                    case "child":
                    case "event":
                        res.locals.name = resultFind.mainPhoto;
                        break;
                }
                const result = await model.deleteOne({ _id: req.body.id });
                if (result == null) {
                    res.status(400);
                    res.end();
                }
                else {
                    switch (type) {
                        case "project":
                        case "child":
                        case "event":
                            next();
                            break;
                        default:
                            res.end();
                            res.status(200);
                            break;
                    }
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
    }
};

module.exports = Req;