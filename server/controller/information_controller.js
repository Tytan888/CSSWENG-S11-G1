const projectController = require('./project_controller');
const eventController = require('./event_controller');
const newsletterController = require('./newsletter_controller');
const singletonController = require('./singleton_controller');

const Info = {
    infoExplore: async function (req, res) {
        let health, livelihood, psychosocial, education;
        let healthPhoto, livelihoodPhoto, psychosocialPhoto, educationPhoto;
        let ongoing, past, upcoming;
        if (req.params.type == 'project') {
            health = await projectController.getProjectsByFilters({ category: 'Health' }, 1);
            livelihood = await projectController.getProjectsByFilters({ category: 'Livelihood' }, 1);
            psychosocial = await projectController.getProjectsByFilters({ category: 'Psychosocial' }, 1);
            education = await projectController.getProjectsByFilters({ category: 'Education' }, 1);
    
            ongoing = await projectController.getProjectsByFilters({ status: 'Ongoing' }, 3);
            past = await projectController.getProjectsByFilters({ status: 'Past' }, 3);
            upcoming = await projectController.getProjectsByFilters({ status: 'Upcoming' }, 3);
        } else if (req.params.type == 'event') {
            health = await eventController.getEventsByFilters({ category: 'Health' }, 1);
            livelihood = await eventController.getEventsByFilters({ category: 'Livelihood' }, 1);
            psychosocial = await eventController.getEventsByFilters({ category: 'Psychosocial' }, 1);
            education = await eventController.getEventsByFilters({ category: 'Education' }, 1);
    
            ongoing = await eventController.getEventsByFilters({ status: 'Ongoing' }, 3);
            past = await eventController.getEventsByFilters({ status: 'Past' }, 3);
            upcoming = await eventController.getEventsByFilters({ status: 'Upcoming' }, 3);
        } else if (req.params.type == 'newsletter') {
            health = await newsletterController.getNewslettersByFilters({ category: 'Health' }, 1);
            livelihood = await newsletterController.getNewslettersByFilters({ category: 'Livelihood' }, 1);
            psychosocial = await newsletterController.getNewslettersByFilters({ category: 'Psychosocial' }, 1);
            education = await newsletterController.getNewslettersByFilters({ category: 'Education' }, 1);
    
            ongoing = await newsletterController.getNewslettersByFilters({ status: 'Ongoing' }, 3);
            past = await newsletterController.getNewslettersByFilters({ status: 'Past' }, 3);
            upcoming = await newsletterController.getNewslettersByFilters({ status: 'Upcoming' }, 3);
        } else {
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
        if (type == 'project') {
            data = await projectController.getAllProjects();
        } else if (type == 'event') {
            data = await eventController.getAllEvents();
        }
        else if (type == 'newsletter') {
            data = await newsletterController.getAllNewsletters();
        } else {
            res.redirect('/404');
            return;
        }
        res.render('search', { data, type, foot: await singletonController.getFooter() });
    },
    infoView: async function (req, res) {
        if (req.params.type == 'project') {
            let id = req.params.id
            let element = await projectController.getProjectById(id)
            if (element == null) {
                res.redirect('/404');
                return;
            }
            res.render('project_event_view', {
                name: element.name,
                description: element.description, category: element.category,
                location: element.location, status: element.status, mainPhoto: element.mainPhoto,
                progress: element.raisedDonations / element.requiredBudget * 100,
                raisedDonations: element.raisedDonations.toLocaleString("en-US"),
                requiredBudget: element.requiredBudget.toLocaleString("en-US"),
                id: element.id, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'event') {
            let id = req.params.id
            let element = await eventController.getEventById(id)
            if (element == null) {
                res.redirect('/404');
                return;
            }
            const startDate = (new Date(Date.UTC(element.startDate.getFullYear(), element.startDate.getMonth(), element.startDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            const endDate = (new Date(Date.UTC(element.endDate.getFullYear(), element.endDate.getMonth(), element.endDate.getDate()))).toISOString().slice(0, 10).replace(/-/g, '/');
            res.render('project_event_view', {
                name: element.name, category: element.category,
                location: element.location, status: element.status, mainPhoto: element.mainPhoto,
                startDate, endDate, id: element.id, foot: await singletonController.getFooter()
            });
        } else if (req.params.type == 'newsletter') {
            let id = req.params.id
            let element = await newsletterController.getNewsletterById(id)
            if (element == null) {
                res.redirect('/404');
                return;
            }
            res.render('newsletter_view', {
                name: element.name, category: element.category,
                status: element.status, photos: element.photos, id: element.id,
                foot: await singletonController.getFooter()
            });
        }
    }
};

module.exports = Info;