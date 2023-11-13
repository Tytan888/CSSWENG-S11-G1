const Admin = require('../models/admin');
const donationController = require('./donation_controller');
const utilityController = require('./utility_controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Info = {
    initializeAdmin: async function () {
        const rest = await Admin.findOne();
        if (rest== null) {
            const passwordHash = await bcrypt.hash("admin", Number(process.env.SALT_ROUNDS));
            const admin = new Admin({ username: "admin", passwordHash: passwordHash });
            await admin.save();
        }
    },
    adminLogin: async function (req, res) {
        res.clearCookie('token');
        res.render('admin_login', { layout: "admin", back: "none" });
    },
    adminSubmit: async function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(401).end();
        } else {
            const result = await Admin.findOne({ username });
            if (result == null) {
                res.status(401).end();
            } else {
                const passwordHash = result.passwordHash;
                const passwordCorrect = await bcrypt.compare(password, passwordHash);
                if (!passwordCorrect) {
                    res.status(401).end();
                } else {
                    const token = jwt.sign({ username }, process.env.SECRET);
                    res.cookie('token', token, {
                        httpOnly: true,
                    });
                    res.status(200).end();
                }
            }
        }
    },
    adminAuth: async function (req, res, next) {
        if (req.cookies.token != null) {
            const decodedToken = jwt.verify(req.cookies.token, process.env.SECRET);
            const username = decodedToken.username;
            const result = await Admin.findOne({ username });
            if (result == null) {
                res.status(404);
                res.redirect('/404');
                return;
            }
            else {
                next();
                return;
            }
        } else {
            res.redirect('/404');
            return;
        }
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
                        data = await utilityController.getElementsByFilters("child", { sponsor: { $ne: null } });
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
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        data = await utilityController.getAllElements(req.params.type);
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