const express = require('express');
//const { student } = require('../data/index');
const router = express.Router();
const index = require('../data/index');
const validate = require("../helpers");
const xss = require('xss');
router.route('/')
.get(async (req, res) => {
    if (!req.session.user) {
        res.redirect('/sign-in');
    } 
    else {
        let emailId = req.session.user.emailId;
        let data = await index.student.getStudentByEmail(emailId); 
        return res.render('./student_profile_page', {title: "Profile", data: data});
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
        //password=password.trim();
        firstName=firstName.trim();
        lastName=lastName.trim();
        contact=contact.trim();
        gender=gender.trim();
        city=city.trim();
        state=state.trim();
        age=age.trim(); 
        let data = await index.student.updateStudentDetails(emailId, firstName, lastName, contact, gender, city, state, age);

        
        req.session.user = {emailId: emailId, userType: 'student', firstName:firstName};
        //let data = await index.student.getStudentByEmail(emailId); 
        return res.render('./student_profile_page', {title: "Profile", data: data, msg: "Profile updated successfully"});
    }catch(e) {
        let data = await index.student.getStudentByEmail(req.body.emailIdInput); 
        res.status(404).render('./student_profile_page', {title: "Profile", data: data, msg: "Profile updated failed", error: e})

    }
})

router.route('/favourites-list')
.get(async (req, res) => {
    if (!req.session.user) {
        res.redirect('/sign-in');
    } 
    else {
        let emailId = req.session.user.emailId;
        let response = await index.student.getStudentByEmail(emailId); 
        //console.log(response.favourites);

        if(!response.favourites || response.favourites.length == 0) {
            return res.render('./student_properties_empty_list_page', {title: "No favourites found"});
        }
        else {
            let data = await index.properties.getAllPropertiesByUser(response.favourites);
            return res.render('./student_favourites_list_page', {title: "Favourites", data: data});
        }
    }
});
//  .post(async (req, res) => {
//     try{
//         await index.student.addFavouriteProperty(req.session.user.emailId, req.params.id);
//         console.log('Added to favs!');
//     } catch(e) {
//         console.log('not added to favs');
//         return res.status(404).render('./error_page', {title: "Error", error: e});

//     }
//  })

router.post('/favourites-list/:id', 
    async(req, res) => {
        try{
            //console.log(req.session.user.emailId);
            await index.student.addFavouriteProperty(xss(req.session.user.emailId), xss(req.params.id));
            console.log('Added to favs!');
            return res.redirect(`/properties/property/${req.params.id}`);

        } catch(e) {
            console.log('not added to favs');
            return res.status(404).render('./error_page', {title: "Error", error: e});

        }
    }
);

router.post('/remove-favourites-list/:id', 
    async(req, res) => {
        try{
            //console.log(req.session.user.emailId);
            await index.student.removeFavouriteProperty(xss(req.session.user.emailId), xss(req.params.id));
            // console.log('Added to favs!');
            return res.redirect(`/properties/property/${req.params.id}`);


        } catch(e) {
            // console.log('not added to favs');
            return res.status(404).render('./error_page', {title: "Error", error: e});

        }
    }
);

module.exports = router;