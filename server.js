// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/controllers'));


//Required for file file upload i.e <form enctype="multipart/form-data">
//var multer  = require('multer');
/*Configure the multer.*/
/*app.use(multer({ dest: './public/images/uploads/',
	
	rename: function (fieldname, filename) {
		renamedImage = filename+Date.now();
	    return renamedImage;
	},
	
	onFileUploadStart: function (file) {
	  console.log(file.originalname + ' is starting ...')
	},
	
	onFileUploadComplete: function (file) {
	  console.log(file.fieldname + ' uploaded to  ' + file.path)
	  done = true;
	}
	
}));*/

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// routes ======================================================================
//load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport); 

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
