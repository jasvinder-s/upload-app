var Image = require('../models/image');

var multer  = require('multer');

module.exports = function(app, passport) {

	app.use(multer({ dest: './public/images/uploads/',
		
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
		
	}));
	
    // HOME PAGE (with login links)
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // LOGIN 
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));   
    
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // PROFILE SECTION =====================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
    	var user = req. user;   	 
    	
    	var query = Image.find({});
    	query.where('user', user);    	
    	 
    	query.exec(function(err, images) {
    		var userImages = [];
    		//console.log(images);
    		//var userImages = [];
    		for(var i = 0;i<images.length;i++){
    	         userImages.push(images[i].name);    	         
    	    }
    		res.render('profile.ejs', {
                user: req.user, // get the user out of session and pass to template
                userImages: userImages
                 
            });
    	}); 
    	
    	 
        
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    //Upload page
    app.get('/upload',isLoggedIn, function(req,res) {
    	//console.log(__dirname);
        //res.sendFile(__dirname + "/views/upload.html");
    	res.render("upload", "");
    	//res.sendfile('upload', {root: '../views'});
    });    
    
    app.post('/api/photo',function(req,res){
    	console.log('api/photo');
    	console.log(done);
    	  if(done == true) {
    	    console.log(req.files);  
    	    console.log('----------->');
    	    var newImage = new Image();
    	    newImage.name = renamedImage+"."+req.files.file.extension;
    	    
    	    
    	    newImage.user = req.user;
    	    // save the image
            newImage.save(function(err, newImage) {
                if (err)
                    throw err;
                //return done(null, newImage);
            });
    	    
    	    res.end("File uploaded.");
    	  }
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
