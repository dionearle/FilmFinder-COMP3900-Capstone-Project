var mongoose = require('mongoose');

// Defining the connection string used to access the cluster.
const uri = "mongodb+srv://admin:qtIdlJqPnF7S46ip@filmfinder.n2dy0.mongodb.net/FilmFinder?retryWrites=true&w=majority";

const config = { useNewUrlParser: true, useUnifiedTopology: true };

// Connecting to the MongoDB Atlas cluster.
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Then we import all of the models in the database.
require('./users');
require('./actors');
require('./movies');
require('./reviews');
require('./reviewsForActor');
require('./groups');
require('./message');