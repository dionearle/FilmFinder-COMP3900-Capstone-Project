var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');

// Importing the MongoDB database.
require('./api/models/db');

require('./api/config/passport');

// Importing all of the routes for the backend API.
var routesApi = require('./api/routes/index');

// Defining a new express app.
var app = express();

//test
require('./parser')(app);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(passport.initialize());

app.use('/api', routesApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// catch unathorised errors
app.use(function(err, req, res, next) {
    if (err.name === 'UnathorizedError') {
        res.status(401);
        res.json({ "message": err.name + ": " + err.message });
    }
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;