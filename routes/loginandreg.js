const express = require('express');
const router = express.Router();
const index = require('../data/index');
const xss = require('xss');
const validate = require("../helpers");

router.route('/')
.get(async (req, res) => {
    if (!req.session.user) {
        res.redirect('/sign-in');
    } 
    else {
        if(req.session.user.userType=='student'){
            res.redirect('/properties');
        }
        else{
            res.redirect('/owners/properties-list');
        }
    }

    // res.redirect('/properties');
})

router.route('/sign-in')
.get(async (req, res) => {
    if (!req.session.user) {
        return res.render('./sign-in_page', {title: "HomeFinder",head:"HomeFinder"});
    } 
    else {
        if(req.session.user.userType=='student'){
            res.redirect('/properties');
        }
        else{
            res.redirect('/owners/properties-list');
        }
    }

    // return res.render('./sign-in_page', {title: "Sign-in Page"});
})
.post(async (req, res) => {
    try {
        let emailId = xss(req.body.emailIdInput);
        let password = xss(req.body.passwordInput);
        let userType = xss(req.body.userType);
        validate.validateUser(emailId, password);
        emailId = emailId.trim().toLowerCase();
        let user;
        if(userType == 'owner'){
            user = await index.owner.checkUser(emailId, password);
        }
        else{
            user = await index.student.checkUser(emailId, password);
        }
        req.session.user = {emailId: emailId, userType: userType, firstName:user.firstName,lastName:user.lastName};
        if(req.session.user.userType=='student'){
            res.redirect('/properties');
        }
        else{
            res.redirect('/owners/properties-list');
        }
    }catch(e) {
        res.status(404).render('./sign-in_page', {title: "Sign-in Page", error: e})
    }
})

router.route('/sign-up')
.get(async (req, res) => {
    if (!req.session.user) {
        return res.render('./sign-up_page', {title: "HomeFinder",head:"HomeFinder"});
    } 
    else {
        if(req.session.user.userType=='student'){
            res.redirect('/properties');
        }
        else{
            res.redirect('/owners/properties-list');
        } 
    }

    // return res.render('./sign-up_page', {title: "Sign-up Form"});
})
.post(async (req, res) => {
    try {
        let emailId = xss(req.body.emailIdInput);
        let password = xss(req.body.passwordInput);
        let firstName = xss(req.body.firstName);
        let lastName = xss(req.body.lastName);
        let contact = xss(req.body.contact);
        let gender = xss(req.body.gender);
        let city = xss(req.body.city);
        let state = xss(req.body.state);
        let age = xss(req.body.age);
        let userType = xss(req.body.userType); 
        validate.validateRegistration(emailId, password, firstName, lastName, contact, gender, city, state, age);
        if(userType == 'owner') await index.owner.createUser(emailId, password, firstName, lastName, contact, gender, city, state, age);
        else await index.student.createUser(emailId, password, firstName, lastName, contact, gender, city, state, age);
        res.redirect('/sign-in');
    }catch(e) {
        res.status(404).render('./sign-up_page', {title: "Sign-up Form", error: e})
    }
})

router.route('/sign-out')
.get(async (req, res) => {
    req.session.destroy();
    res.clearCookie('AuthCookie');
    return res.render('./logout_page', {title: "Logout Successful",head:"Logout Successful"});
})


module.exports = router;