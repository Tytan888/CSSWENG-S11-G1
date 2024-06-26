/**
 * This module contains all of the functions that are used to handle requests and operations surrounding
 * the admin pages. In particular, this module handles Epic 3: Admin Control and Epic 4: Admin Tracker.
 * @module server/controller/admin_controller
 * 
 * @requires {@link module:server/models/admin}
 * @requires {@link module:server/controller/donation_controller}
 * @requires {@link module:server/controller/utility_controller}
 * @requires {@link bcrypt}
 * @requires {@link jsonwebtoken}
 */
const Admin = require('../models/admin');
const donationController = require('./donation_controller');
const utilityController = require('./utility_controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * This object to be exported contains all of the functions that are used to handle requests to the admin pages.
 * 
 * @typedef {object} adminController
 * @memberof module:server/controller/admin_controller
 * @inner
 * 
 * @property {Function} initializeAdmin - Initializes the admin account if it does not exist.
 * @property {Function} adminLogin - Handles GET requests to render the admin login page.
 * @property {Function} adminSubmit - Handles POST requests to submit the admin login form, checks if the username and password are correct.
 * @property {Function} adminAuth - Serves as middleware to check if the admin is logged in.
 * @property {Function} adminMenu - Handles GET requests to render the admin menu page.
 * @property {Function} adminMain - Handles GET requests to render pages based on the type of action and type of element.
 */
const Adm = {
    initializeAdmin: async function () {
        /* Check if the admin account exists. */
        const rest = await Admin.findOne();

        /* If the admin account does not exist, create it. */
        if (rest == null) {
            const passwordHash = await bcrypt.hash("admin", Number(process.env.SALT_ROUNDS));
            const admin = new Admin({ username: "admin", passwordHash: passwordHash });
            await admin.save();
        }
    },
    adminLogin: async function (req, res) {
        /* Check if the admin is already logged in using the token. */
        res.clearCookie('token');
        res.render('admin_login', { layout: "admin", back: "/" });
    },
    adminSubmit: async function (req, res) {
        /* Extract the username and password from the request body. */
        const username = req.body.username;
        const password = req.body.password;

        /* Check if the username and password are empty. */
        if (!username || !password) {
            /* If the username or password is empty, return a 401 error. */
            res.status(401).end();
        } else {
            /* Check if the username exists in the database. */
            const result = await Admin.findOne({ username });
            if (result == null) {
                /* If the username does not exist, return a 401 error. */
                res.status(401).end();
            } else {
                /* If the username exists, check if the password is correct. */
                const passwordHash = result.passwordHash;
                const passwordCorrect = await bcrypt.compare(password, passwordHash);
                if (!passwordCorrect) {
                    /* If the password is incorrect, return a 401 error. */
                    res.status(401).end();
                } else {
                    /* If the password is correct, create a token and set it as a cookie. */
                    const token = jwt.sign({ username }, process.env.SECRET);
                    res.cookie('token', token, {
                        httpOnly: true,
                    });

                    /* Return a 200 status code. */
                    res.status(200).end();
                }
            }
        }
    },
    adminAuth: async function (req, res, next) {
        /* Check if the token exists in the cookies. */
        if (req.cookies.token != null) {
            /* If the token exists, check if the token is valid. */
            const decodedToken = jwt.verify(req.cookies.token, process.env.SECRET);
            const username = decodedToken.username;
            const result = await Admin.findOne({ username });
            if (result == null) {
                /* If the token is invalid, return a 404 error. */
                res.status(404);
                res.redirect('/404');
                return;
            }
            else {
                /* If the token is valid, call the next function. */
                next();
                return;
            }
        } else {
            /* If the token does not exist, return a 404 error. */
            res.redirect('/404');
            return;
        }
    },
    adminMenu: async function (req, res) {
        /* Render the admin menu page. */
        res.render('admin_menu', { layout: "admin", back: "/admin/login" });
    },
    adminMain: async (req, res, next) => {
        let data;

        /* Extract the action and type from the route parameters. */
        switch (req.params.action) {
            /* If the action is undefined, render the admin lookup page. */
            case undefined:
                switch (req.params.type) {
                    /* If the type is sponsor or donation, render the admin lookup page for that type. */
                    case "sponsor":
                    case "donation":
                        data = await donationController.getAllDonations(req.params.type);
                        res.render('admin_lookup', { layout: "admin", back: "/admin/menu", type: req.params.type, data });
                        return;
                    /* Otherwise, redirect to the 404 page. */
                    default:
                        res.redirect('/404');
                        return;
                }
                return;
            /* If the action is select, render the admin select page. */
            case "select":
                switch (req.params.type) {
                    /* If the type is project, child, event, newsletter, staff, or trustee, render the admin select page for that type. */
                    case "project":
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        data = await utilityController.getAllElements(req.params.type);
                        break;
                    /* Otherwise, redirect to the 404 page. */
                    default:
                        res.redirect('/404');
                        return;
                }
                res.render('admin_select', { layout: "admin", back: "/admin/menu", type: req.params.type, data });
                return;
            /* If the action is add, render the admin add page. */
            case "add":
                switch (req.params.type) {
                    /* If the type is project, child, event, newsletter, staff, or trustee, render the admin add page for that type. */
                    case "project":
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/" + req.params.type + "/select", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    /* Otherwise, redirect to the 404 page. */
                    default:
                        res.redirect('/404');
                        return;
                }
            /* If the action is edit, render the admin edit page. */
            case "edit":
                switch (req.params.type) {
                    /* If the type is project, child, event, newsletter, staff, or trustee, render the admin edit page for that type. */
                    case "project":
                    case "child":
                    case "event":
                    case "newsletter":
                    case "staff":
                    case "trustee":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/" + req.params.type + "/select", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    /* If the type is other, redirect to the admin edit other page. */
                    case "other":
                        res.render('admin_add_edit', { layout: "admin", back: "/admin/menu", type: req.params.type, action: req.params.action, id: req.params.id });
                        return;
                    /* Otherwise, redirect to the 404 page. */
                    default:
                        res.redirect('/404');
                        return;
                }
            /* If the action is edit-group, render the admin edit group page. */
            case "edit-group":
                if (req.params.type == "staff") {
                    res.render('admin_edit_staff_photo', { layout: "admin", back: "/admin/" + req.params.type + "/select" });
                }
                return;
            /* Otherwise, redirect to the 404 page. */
            default:
                res.redirect('/404');
                return;
        }
    }
};

/* Export the module. */
module.exports = Adm;