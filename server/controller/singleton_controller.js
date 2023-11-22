const Singleton = require('../models/singleton.js');

const Sing = {
    initializeSingleton: async function () {
        if (await Singleton.findOne({ id: "Singleton" }) == null)
            await Singleton.create({ id: "Singleton" });
    },
    getOthers: async function (req, res) {
        const result = await Singleton.findOne({ id: "Singleton" });
        delete result.staffPhoto;
        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(result);
        }
    },
    updateOthers: async function (req, res, next) {
        const resultFind = await Singleton.findOne({ id: "Singleton" });
        res.locals.name = resultFind.frontpagePhoto;

        let update = req.body;
        if (req.file != null)
            update.frontpagePhoto = req.file.filename;

        const result = await Singleton.updateOne({ id: "Singleton" }, { $set: update });
        if (result == null) {
            res.status(400);
            res.end();
        } else {
            if (req.file != null && res.locals.name != "N/A") {
                next();
            }
            else {
                res.end()
                res.status(200);
            }
        }
    },
    getIndex: async function () {
        const result = await Singleton.findOne({ id: "Singleton" });
        if (result == null) {
            await this.initializeSingleton();
            return this.getIndex();
        }
        else
            return { aboutUs: result.aboutUs, mission: result.mission, vision: result.vision, projectsDescription: result.projectsDescription, newsletterDescription: result.newsletterDescription, frontpagePhoto: result.frontpagePhoto };
    },
    getFooter: async function () {
        const result = await Singleton.findOne({ id: "Singleton" });
        if (result == null) {
            await this.initializeSingleton();
            return this.getFooter();
        }
        else
            return { email: result.email, facebook: result.facebook, instagram: result.instagram, twitter: result.twitter, address: result.address, phone: result.phone, aboutUs: result.aboutUs };
    },
    getAbout: async function () {
        const result = await Singleton.findOne({ id: "Singleton" });
        if (result == null) {
            await this.initializeSingleton();
            return this.getAbout();
        }
        else
            return { ourFounder: result.ourFounder, philippineJourney: result.philippineJourney, weBelieve: result.weBelieve, aboutHealth: result.aboutHealth, aboutLivelihood: result.aboutLivelihood, aboutPsychosocial: result.aboutPsychosocial, aboutEducation: result.aboutEducation };
    },
    getStaffPhoto: async function () {
        const result = await Singleton.findOne({ id: "Singleton" });
        if (result == null) {
            await this.initializeSingleton();
            return this.getStaffPhoto();
        }
        else {
            return result.staffPhoto;
        }
    },
    updateStaffPhoto: async function (req, res, next) {
        const resultFind = await Singleton.findOne({ id: "Singleton" });
        res.locals.name = resultFind.staffPhoto;

        let result = await Singleton.updateOne({ id: "Singleton" }, { $set: { staffPhoto: req.file.filename } })

        if (result == null) {
            res.status(400);
            res.end();
        } else {
            if (res.locals.name != "N/A") {
                next();
            }
            else {
                res.end()
                res.status(200);
            }
        }
    }
};

module.exports = Sing;