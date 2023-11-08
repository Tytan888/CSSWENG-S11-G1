const Admin = require('../models/admin');
const projectController = require('./project_controller');
const childController = require('./child_controller');
const eventController = require('./event_controller');
const newsletterController = require('./newsletter_controller');
const staffController = require('./staff_controller');
const trusteeController = require('./trustee_controller');
const donationController = require('./donation_controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Info = {
    initializeAdmin: async function () {
        if (await Admin.findOne() == null) {
            const passwordHash = await bcrypt.hash("admin", Number(process.env.SALT_ROUNDS));
            const admin = new Admin({ username: "admin", passwordHash: passwordHash });
            await admin.save();
        }
    },
    adminLogin: async function (req, res) {
        res.render('admin_login', { layout: "admin", back: "/admin/login" });
    },
    adminLoginSubmit: async function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(401).end();
        } else {
            const result = await Admin.findOne({ username: username });
            if (result == null) {
                res.status(401).end();
            } else {
                const passwordHash = result.passwordHash;
                const passwordCorrect = await bcrypt.compare(password, passwordHash);
                if (!passwordCorrect) {
                    res.status(401).end();
                } else {
                    const token = jwt.sign({ email }, process.env.SECRET);
                    res.cookie('token', token, {
                        httpOnly: true,
                    });
                    res.status(200).end();
                }
            }
        }
    },
    adminAuth: async function (req, res, next) {
        next();
    },
    adminMenu: async function (req, res) {
        res.render('admin_menu', { layout: "admin", back: "/admin/login" });
    },
    adminMain: async (req, res, next) => {
        let data;
        switch (req.params.action) {
            case undefined:
                switch (req.params.type) {
                    case "sponsor":
                        data = await childController.getAllChildrenWithSponsor();
                        res.render('admin_lookup', { layout: "admin", back: "/admin/menu", type: req.params.type, data });
                        return;
                    case "donation":
                        data = await donationController.getAllDonations();
                        res.render('admin_lookup', { layout: "admin", back: "/admin/menu", type: req.params.type, data });
                        return;
                }
                return;
            case "select":
                switch (req.params.type) {
                    case "project":
                        data = await projectController.getAllProjects();
                        break;
                    case "child":
                        data = await childController.getAllChildren();
                        break;
                    case "event":
                        data = await eventController.getAllEvents();
                        break;
                    case "newsletter":
                        data = await newsletterController.getAllNewsletters();
                        break;
                    case "staff":
                        data = await staffController.getAllStaffs();
                        break;
                    case "trustee":
                        data = await trusteeController.getAllTrustees();
                        break;
                    default:
                        res.redirect('/404');
                        return;
                }
                res.render('admin_select', { layout: "admin", back: "/admin/menu", type: req.params.type, data });
                return;
            case "add":
                switch (req.params.type) {
                    case "project":
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/" + req.params.type + "/select", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    default:
                        res.redirect('/404');
                        return;
                }
            case "edit":
                switch (req.params.type) {
                    case "project":
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/" + req.params.type + "/select", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    case "other":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/menu", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    default:
                        res.redirect('/404');
                        return;
                }
            case "edit-group":
                if (req.params.type == "staff") {
                    res.render('admin_edit_staff_photo', { layout: "admin", back: "/admin/" + req.params.type + "/select" });
                }
                return;
            default:
                res.redirect('/404');
                return;
        }
    }
};

module.exports = Info;