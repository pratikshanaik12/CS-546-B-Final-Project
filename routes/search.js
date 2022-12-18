const express = require('express');
const router = express.Router();
const xss = require('xss');
const index = require('../data/index');

router.route('/')
.get(async (req, res) => {
  if (!req.session.user) {
    res.redirect('/sign-in');
  } 
  else {
    try {
      let search = xss(req.query['search-input']);
      let searchPropresults = await index.properties.searchProp(search);
      res.render('./search', {title:"Seach Results",head:"Search",searchPropresults: searchPropresults,searchQuery:search});
    } catch (e) {
      //console.log(err);
      res.status(404).render('./error_page', {error1: e})
    }
  }
});

router.route('/filter').get(async (req, res) => {
  if (!req.session.user) {
    res.redirect('/sign-in');
  } 
  else {
    try {
      let search = xss(req.query['search-input']);
      let searchPropresults = await index.properties.searchProp(search);
      res.render('./search', {title:"Seach Results",head:"Search",searchPropresults: searchPropresults,searchQuery:search});
    } catch (e) {
      //console.log(err);
      res.status(404).render('./error_page', {error: e})
    }
  }
});

module.exports = router;