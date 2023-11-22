const utilityController = require('./utility_controller');
const singletonController = require('./singleton_controller');

const Info = {
    infoIndex: async function (req, res) {
        res.render('index', {
            index: await singletonController.getIndex(),
            projects: await utilityController.getElementsByAmount("project", 3),
            newsletter: await utilityController.getElementsByAmount("newsletter", 3),
            foot: await singletonController.getFooter()
        });
    },
    info404: async function (req, res) {
        res.render('404', { foot: await singletonController.getFooter() });
    },
    infoAbout: async function (req, res) {
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
        let health = await utilityController.getElementsByFilters(req.params.type, { category: 'Health' }, 1);
        let livelihood = await utilityController.getElementsByFilters(req.params.type, { category: 'Livelihood' }, 1);
        let psychosocial = await utilityController.getElementsByFilters(req.params.type, { category: 'Psychosocial' }, 1);
        let education = await utilityController.getElementsByFilters(req.params.type, { category: 'Education' }, 1);

        let ongoing = await utilityController.getElementsByFilters(req.params.type, { status: 'Ongoing' }, 3);
        let past = await utilityController.getElementsByFilters(req.params.type, { status: 'Past' }, 3);
        let upcoming = await utilityController.getElementsByFilters(req.params.type, { status: 'Upcoming' }, 3);

        let healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto;

        if (req.params.type != 'project' && req.params.type != 'event' && req.params.type != 'newsletter') {
            res.redirect('/404');
            return;
        }
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
        res.render('explore', {
            healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto,
            ongoing, past, upcoming, type: req.params.type, foot: await singletonController.getFooter()
        });
    },
    infoSearch: async function (req, res) {
        const type = req.params.type;
        let data;
        switch (type) {
            case 'project':
            case 'event':
            case 'newsletter':
                data = await utilityController.getAllElements(type);
                break;
            default:
                res.redirect('/404');
                return;
        }
        res.render('search', { data, type: req.params.type, foot: await singletonController.getFooter() });
    },
    infoView: async function (req, res) {
        let id = req.params.id;
        let element = await utilityController.getElementById(req.params.type, id);
        if (element == null) {
            res.redirect('/404');
            return;
        }
        if (req.params.type == 'project') {
            element.progress = element.raisedDonations / element.requiredBudget * 100;
            element.raisedDonations = element.raisedDonations.toLocaleString("en-US");
            element.requiredBudget = element.requiredBudget.toLocaleString("en-US");
            res.render('project_event_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'event') {
            element.startDate = (new Date(Date.UTC(element.startDate.getFullYear(), element.startDate.getMonth(), element.startDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            element.endDate = (new Date(Date.UTC(element.endDate.getFullYear(), element.endDate.getMonth(), element.endDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            res.render('project_event_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'newsletter') {
            res.render('newsletter_view', {
                type: req.params.type, element, foot: await singletonController.getFooter()
            });
        }
    }
};

module.exports = Info;