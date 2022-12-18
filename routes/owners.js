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
        let emailId = req.session.user.emailId;
        validate.validateEmail(emailId);
        let data = await index.owner.getOwnerByEmail(emailId); 
        return res.render('./owner_profile_page', {title: "Profile",head:"Profile", data: data, msg: ""});
    }
})
.post(async (req, res) => {
    try {
        let emailId = xss(req.body.emailIdInput);
        let firstName = xss(req.body.firstName);
        let lastName = xss(req.body.lastName);
        let contact = xss(req.body.contact);
        let gender = xss(req.body.gender);
        let city = xss(req.body.city);
        let state = xss(req.body.state);
        let age = xss(req.body.age);
        
        validate.validateUpdate(emailId,firstName,lastName,contact,gender,city,state,age);
        emailId=emailId.trim().toLowerCase();
        firstName=firstName.trim();
        lastName=lastName.trim();
        contact=contact.trim();
        gender=gender.trim();
        city=city.trim();
        state=state.trim();
        age=age.trim();
        let oldEmailId = req.session.user.emailId;
        let userType = req.session.user.userType
        let data = await index.owner.updateOwnerDetails(oldEmailId,emailId, firstName, lastName, contact, gender, city, state, age);
        
        req.session.user = {emailId: emailId, userType: userType, firstName:firstName,lastName:lastName}; 
        
        return res.render('./owner_profile_page', {title: "Profile",head:"Profile", data: data, msg: "Profile updated successfully"});
    }catch(e) {
        let data = await index.owner.getOwnerByEmail(xss(req.body.emailIdInput));
        res.status(404).render('./owner_profile_page', {title: "Profile",head:"Profile", data: data, msg: "Profile update failed", error: e})
    }
})

router.route('/properties-list')
.get(async (req, res) => {
    if (!req.session.user) {
        res.redirect('/sign-in');
    } 
    else {
        let emailId = req.session.user.emailId;
        validate.checkEmail(emailId);
        let response = await index.owner.getOwnerByEmail(emailId); 
        if(!response.properties || response.properties.length == 0) return res.render('./owner_properties_empty_list_page', {title: "No properties found"});
        else {
            let data = await index.properties.getAllPropertiesByUser(response.properties);
            return res.render('./owner_properties_list_page', {title:"Properties",head: `Hello ${req.session.user.firstName}, here are your properties`, data: data});
        }
    }
})

module.exports = router;