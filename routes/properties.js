const express = require('express');
const router = express.Router();
const index = require('../data/index');

router.route('/')
.get(async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/sign-in');
        } 
        else {
            let data = await index.properties.getAllProperties();
            return res.render('./properties', {title: "All Properties", data: data});
        }
    }catch(e) {
        return res.status(500).render('./error', {title: "Error", error: e});
    }
})

router.route('/:id')
.get(async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/sign-in');
        } 
        else {
            let id = req.params.id;
            let data = await index.properties.getPropertyById(id);
            return res.render('./property', {title: "Property", data: data});
        }
    }catch(e) {
        return res.status(404).render('./error', {title: "Error", error: e});
    }
})

router.route('/:id/comments')
.post(async (req, res) => {
    try {
        if (!req.session.user) {
            res.redirect('/sign-in');
        } 
        else {
            let id = req.params.id;
            let data = await index.properties.getPropertyById(id);
            return res.render('./property', {title: "Property", data: data});
        }
    }catch(e) {
        return res.status(404).render('./error', {title: "Error", error: e});
    }
})

module.exports = router;