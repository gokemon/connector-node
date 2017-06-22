/*/ Get dependencies /*/
var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'), // Server middleware for handling and routing HTTP requests
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'), //Cross-origin resource sharing
    passport = require('passport'), // for authentication
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose'); // modeling and mapping MongoDB data to javascript

var isProduction = process.env.NODE_ENV === 'production';
// I need better comments on the above...

/*/ Creates express app /*/
var app = express();
app.use(cors());
// no view engine setup needed


/* Normal express config defaults  */
app.use(require('morgan')('dev'));
/* Parsers for POST data */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'connector', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if (!isProduction) {
    app.use(errorhandler());
}

if (isProduction) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect('mongodb:/*localhost/connector');
    mongoose.set('debug', true);
}

/* Get our API routes */
app.use(require('./routes'));


/*/ catch 404 and forward to error handler  */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



/*/ error handlers  /*/

/* development error handler  */
/* will print stacktrace  */
if (!isProduction) {
    app.use(function(err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({
            'errors': {
                message: err.message,
                error: err
            }
        });
    });
}

/* production error handler  */
/* no stacktraces leaked to user  */
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'errors': {
            message: err.message,
            error: {}
        }
    });
});


/*/ Initialize and start the app server /*/
var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port ' + server.address().port);
});