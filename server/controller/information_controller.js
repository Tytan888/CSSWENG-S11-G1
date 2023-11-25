/**
 * This module contains all of the functions that are used to handle requests surrounding the pages
 * that contain information about the organization. In particular, this module handles Epic 1: User Exploration.
 * 
 * @module server/controller/information_controller
 * 
 * @requires {@link module:server/controller/utility_controller}
 * @requires {@link module:server/controller/singleton_controller}
*/
const utilityController = require('./utility_controller');
const singletonController = require('./singleton_controller');

/**
 * This object to be exported contains all of the functions that are used to handle requests to the pages
 * that contain information about the organization.
 * 
 * @typedef {object} infoController
 * @memberof module:server/controller/information_controller
 * @inner
 * 
 * @property {Function} infoIndex - Handles GET requests to render the index page.
 * @property {Function} info404 - Handles GET requests to render the 404 page.
 * @property {Function} infoAbout - Handles GET requests to render the about us page.
 * @property {Function} infoExplore - Handles GET requests to render the explore pages, depending on the type of element (project, event, newsletter).
 * @property {Function} infoSearch - Handles GET requests to render the search pages, depending on the type of element (project, event, newsletter).
 * @property {Function} infoView - Handles GET requests to render the view pages, depending on the type of element (project, event, newsletter).
*/
const Info = {
    infoIndex: async function (req, res) {
        /* Render the index page. */
        res.render('index', {
            index: await singletonController.getIndex(),
            projects: await utilityController.getElementsByAmount("project", 3),
            newsletter: await utilityController.getElementsByAmount("newsletter", 3),
            foot: await singletonController.getFooter()
        });
    },
    info404: async function (req, res) {
        /* Render the 404 page. */
        res.render('404', { foot: await singletonController.getFooter() });
    },
    infoAbout: async function (req, res) {
        /* Render the about us page. */
        res.render('about', {
            index: await singletonController.getIndex(),
            about: await singletonController.getAbout(),
            trustees: await utilityController.getAllElements("trustee"),
            staff: await utilityController.getAllElements("staff"),
            foot: await singletonController.getFooter(),
            staffPhoto: await singletonController.getStaffPhoto()
        });
    },
    infoExplore: async function (req, res) {
        /* Retrieve one element of each category from the database to be displayed in the explore page. */
        let health = await utilityController.getElementsByFilters(req.params.type, { category: 'Health' }, 1);
        let livelihood = await utilityController.getElementsByFilters(req.params.type, { category: 'Livelihood' }, 1);
        let psychosocial = await utilityController.getElementsByFilters(req.params.type, { category: 'Psychosocial' }, 1);
        let education = await utilityController.getElementsByFilters(req.params.type, { category: 'Education' }, 1);

        /* Retrieve the first three elements of each status from the database to be displayed in the explore page. */
        let ongoing = await utilityController.getElementsByFilters(req.params.type, { status: 'Ongoing' }, 3);
        let past = await utilityController.getElementsByFilters(req.params.type, { status: 'Past' }, 3);
        let upcoming = await utilityController.getElementsByFilters(req.params.type, { status: 'Upcoming' }, 3);

        /* Check if the type of element is valid. */
        if (req.params.type != 'project' && req.params.type != 'event' && req.params.type != 'newsletter') {
            /* If the type of element is invalid, redirect to the 404 page. */
            res.redirect('/404');
            return;
        }

        /* Obtain the main photo of each category to be displayed in the explore page. */
        let healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto;
        if (req.params.type == 'project' || req.params.type == 'event') {
            if (health.length == 1) {
                healthPhoto = health[0].mainPhoto;
            } else {
                healthPhoto = "default.jpg";
            }
            if (livelihood.length == 1) {
                livelihoodPhoto = livelihood[0].mainPhoto;
            } else {
                livelihoodPhoto = "default.jpg";
            }
            if (psychosocial.length == 1) {
                psychosocialPhoto = psychosocial[0].mainPhoto;
            } else {
                psychosocialPhoto = "default.jpg";
            }
            if (education.length == 1) {
                educationPhoto = education[0].mainPhoto;
            } else {
                educationPhoto = "default.jpg";
            }
        } else if (req.params.type == 'newsletter') {
            if (health.length == 1) {
                healthPhoto = health[0].photos[0];
            } else {
                healthPhoto = "default.jpg";
            }
            if (livelihood.length == 1) {
                livelihoodPhoto = livelihood[0].photos[0];
            } else {
                livelihoodPhoto = "default.jpg";
            }
            if (psychosocial.length == 1) {
                psychosocialPhoto = psychosocial[0].photos[0];
            } else {
                psychosocialPhoto = "default.jpg";
            }
            if (education.length == 1) {
                educationPhoto = education[0].photos[0];
            } else {
                educationPhoto = "default.jpg";
            }
        }

        /* Render the explore page. */
        res.render('explore', {
            healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto,
            ongoing, past, upcoming, type: req.params.type, foot: await singletonController.getFooter()
        });
    },
    infoSearch: async function (req, res) {
        /* Extract the type from the route parameters. */
        const type = req.params.type;

        /* Check if the type of element is valid. */
        let data;
        switch (type) {
            case 'project':
            case 'event':
            case 'newsletter':
                /* If the type of element is valid, retrieve all elements of that type from the database. */
                data = await utilityController.getAllElements(type);
                break;
            default:
                /* If the type of element is invalid, redirect to the 404 page. */
                res.redirect('/404');
                return;
        }

        /* Render the search page. */
        res.render('search', { data, type: req.params.type, foot: await singletonController.getFooter() });
    },
    infoView: async function (req, res) {
        /* Retrieve the element with the given id from the database. */
        let id = req.params.id;
        let element = await utilityController.getElementById(req.params.type, id);

        /* Check if the element exists. */
        if (element == null) {
            /* If the element does not exist, redirect to the 404 page. */
            res.redirect('/404');
            return;
        }

        /* Check if the type of element is valid. */
        if (req.params.type == 'project') {
            /* Calculate and pre-format some attributes of the project. */
            element.progress = element.raisedDonations / element.requiredBudget * 100;
            element.raisedDonations = element.raisedDonations.toLocaleString("en-US");
            element.requiredBudget = element.requiredBudget.toLocaleString("en-US");

            /* Render the project view page. */
            res.render('project_event_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'event') {
            /* Properly format the dates of the event. */
            element.startDate = (new Date(Date.UTC(element.startDate.getFullYear(), element.startDate.getMonth(), element.startDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            element.endDate = (new Date(Date.UTC(element.endDate.getFullYear(), element.endDate.getMonth(), element.endDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            
            /* Render the event view page. */
            res.render('project_event_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'newsletter') {
            /* Render the newsletter view page. */
            res.render('newsletter_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        }
    }
};

/* Export the module. */
module.exports = Info;