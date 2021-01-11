//midlleware function to get a nicely formatted body for POST or PUT HTTP request
var bodyParser = require('body-parser');
module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
   };