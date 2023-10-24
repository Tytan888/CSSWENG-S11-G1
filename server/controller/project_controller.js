const Project = require('../models/project.js');
const db = require('../config/db.js');
// TODO: Also for adding, editing, and deleting projects, make sure only admins can access these pages and authenticate them.
// TODO: When editing and deleting projects, the old image should be deleted from the database.
const Proj = {
    getProject: async function(req, res){
        const result = await Project.findOne({ id: req.query.id });
        if (result == null) {
            res.status(400);
            res.end();
        }
        else {
            res.status(200);
            res.json(result);
        }
    },
    getProjects: async function(req, res, page, limit){
        const result = await Project.find().sort({ $natural: -1 }).skip((page - 1) * limit).limit(limit).lean();
        return result;
    },
    createProject: async function(req, res){
        let last = await Project.find().sort({ $natural: -1 }).limit(1);
        let newID = 1;
        const suffix = "Project-"
        if (last.length == 1)
            newID = parseInt(last[0].id.substring(suffix.length)) + 1;
        newID = suffix + newID.toString().padStart(7, "0");
        
        const result = await Project.create({ id: newID, name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename })
    
        if(result == null){
            res.status(400);
            res.end();
        }else{
            res.status(200);
            // TODO: Redirect to the correct page.
            res.redirect('/html/test_view_project.html?id=' + newID);
        }
    },
    updateProject: async function (req, res){
        let result;

        if(req.file == null)
            result = await Project.updateOne({id: req.body.id}, {  $set: {name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status}})
        else
            result = await Project.updateOne({id: req.body.id}, { $set: {name: req.body.name, category: req.body.category, description: req.body.description, location: req.body.location, raisedDonations: req.body.raisedDonations, requiredBudget: req.body.requiredBudget, status: req.body.status, mainPhoto: req.file.filename }})
        
            if(result == null){
            res.status(400);
            res.end();
        }else{
            res.status(200);
            // TODO: Redirect to the correct page.
            res.redirect('/html/test_view_project.html?id=' + req.body.id);
        }
    },

    deleteProject: async function(req, res){
        const result = await Project.deleteOne({ id: req.body.id });
        if (result == null) {
            res.status(400);
            res.end();
        }
        else {
            res.status(200);
            res.json(result);
        }
    },
  };
  
  module.exports = Proj;