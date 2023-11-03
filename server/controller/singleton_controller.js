const Singleton = require('../models/singleton.js');

// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting projects, the old image should be deleted from the database.
const Sing = {
    initializeSingleton: async function () {
        const result = await Singleton.create({ id: "Singleton" });
        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json("Singleton");
        }
    },
    getSingleton: async function (req, res) {
        const result = await Singleton.findOne({ id: "Singleton" });
        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json(result);
        }
    },
    getFooter: async function () {
        const result = await Singleton.findOne({ id: "Singleton" });
        return { email: result.email, facebook: result.facebook, instagram: result.instagram, twitter: result.twitter, address: result.address, phone: result.phone, aboutUs: result.aboutUs };
    },
    getIndex: async function (req, res) {
        const result = await Singleton.findOne({ id: "Singleton" });
        return { aboutUs: result.aboutUs, mission: result.mission, vision: result.vision, projectsDescription: result.projectsDescription, newsletterDescription: result.newsletterDescription, frontpagePhoto: result.frontpagePhoto };
    },
    updateOthers: async function (req, res) {
        let updates
        if (req.file == null)
            updates = { aboutUs: req.body.aboutUs, mission: req.body.mission, vision: req.body.vision, projectsDescription: req.body.projectsDescription, newsletterDescription: req.body.newsletterDescription, email: req.body.email, facebook: req.body.facebook, instagram: req.body.instagram, twitter: req.body.twitter, address: req.body.address, phone: req.body.phone }
        else
            updates = { aboutUs: req.body.aboutUs, mission: req.body.mission, vision: req.body.vision, projectsDescription: req.body.projectsDescription, newsletterDescription: req.body.newsletterDescription, email: req.body.email, facebook: req.body.facebook, instagram: req.body.instagram, twitter: req.body.twitter, address: req.body.address, phone: req.body.phon, frontpagePhoto: req.file.filename }
        
        const result = await Singleton.updateOne({ id: "Singleton" }, { $set: updates });
        if (result == null) {
            res.status(400);
            res.end();
        } else {
            res.status(200);
            res.json("/html/test_view_singleton.html");
        }
    }
};

module.exports = Sing;