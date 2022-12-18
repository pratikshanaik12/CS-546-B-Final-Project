
const loginAndRegRoute = require('./loginandreg.js');
const ownerRoute = require('./owners');
const studentRoute = require('./students');
const propertieRoute = require('./properties');
const searchRoute = require('./search');


const constructorMethod = (app) => {
  app.use('/', loginAndRegRoute);
  app.use('/owners', ownerRoute);
  app.use('/students', studentRoute);
  app.use('/properties', propertieRoute);
  app.use('/search', searchRoute);

  app.use('*', (req, res) => {
    if (!req.session.user) {
      res.redirect('/sign-in');
    }
    else { 
      return res.status(404).render('./error_page', {title: "Error", error: "Oops! the page you are searching doesn't exist"});
    }
  });
};

module.exports = constructorMethod;