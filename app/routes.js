var Image = require('../models/image');

var multer  = require('multer');
var fs = require('fs');
var lwip = require('lwip');

var logger = require('./../public/libs/logger');
var uploadsFolder = './public/images/uploads';  

var path = require('path'); 

module.exports = function(app, passport) {

	app.use(multer({ dest: uploadsFolder,
		
		rename: function (fieldname, filename) {
			renamedImage = filename+Date.now();
		    return renamedImage;
		},
		
		onFileUploadStart: function (file) {
			logger.debug(file.originalname + ' is starting ...');
		},
		
		onFileUploadComplete: function (file, req, res) {
			logger.debug(file.fieldname + ' uploaded to  ' + file.path)
			logger.debug('renamedImage ' + renamedImage);	  
		   
			var newImageName = renamedImage+"."+file.extension;
			logger.debug('newImageName ' + newImageName);
			try {
				createImageThumbnail(newImageName, req, res);
			} catch (err) {
				logger.error(err);
			}	  
		} 	
		 
	}));
	
	app.post('/api/photo',function(req,res){
		//multer middleware already handled photos upload
		logger.debug('api/photo');    	     
    });
	
	app.get('/', function(req, res) {
		res.render('index', { title: 'Express' });
	});
	
	app.get('/thumbnails', function(req, res) {
		logger.debug('routes.js#/thumbnails');
		var query = Image.find().sort({_id: -1});	
		 
		query.exec(function(err, images) {
			 res.send(images)
		}); 
	});
	
	//route to log in 
    app.post('/login', function(req, res, next) {
    	logger.debug("routes.js#login");
    	passport.authenticate('local-login', function(err, user, info) {
			if (err) {
			  return res.status(500).json({err: err});
			}
			if (!user) {
			  return res.status(401).json({err: info});
			}
			req.logIn(user, function(err) {
				if (err) {
			    return res.status(500).json({err: 'Could not log in user'});
			}
		    res.status(200).json({status: 'Login successful!', user: user});
		    });
    	})(req, res, next);
    });
    
    app.post('/signup', function(req, res, next) {
    	logger.debug("routes.js#signup");
    	passport.authenticate('local-signup', function(err, user, info) {
    	    if (err) {
    	      return res.status(500).json({err: err});
    	    }
    	    
    	    if(user) {
    	    	res.status(200).json({status: 'Signup successful', user: user});
    	    } else {
    	    	res.status(500).json({status: 'Signup failed', err: info.message});
    	    }
    	  })(req, res, next);
    });
    
    
    app.get('/profile', isLoggedIn, function(req, res) {
    	logger.debug('routes.js# /profile');
    	var user = req. user;   	 
    	logger.debug('user ' + user);
    	var query = Image.find().sort({_id: -1});
    	query.where('user', user);    	
    	 
    	query.exec(function(err, images) {
    		var userImages = [];
    		
    		for(var i = 0;i<images.length;i++){
    			var userImage = {};
    			 userImage.name = images[i].name;
    			 userImages.push(userImage);
    	    }
    		logger.debug(userImages);
    		res.status(200).json(userImages);
    	});        
    });
    
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });  
};

function createImageThumbnail(imageName, req, res) {
	var srcImagePath = uploadsFolder + "/" + imageName;
	var thumbnailImagePath = uploadsFolder + "/thumbnails/thumbnail_" + imageName;
	logger.debug('createImageThumbnail srcImagePath ' + srcImagePath);
	logger.debug('createImageThumbnail destImagePath' + thumbnailImagePath);
	
	var lwipImage;
    lwip.open(srcImagePath , function(err, image) {
    	logger.debug('lwip open');   	 
    	lwipImage = image;
    	if(err) {
    		logger.debug('err');
    		var lastIndexOfDot = srcImagePath.lastIndexOf('.');
    		var extension = srcImagePath.substring(lastIndexOfDot);
    		logger.debug('1. extension ' +extension);
    		    		 
    		if(extension == extension.toUpperCase()) {
    			extension = extension.toLowerCase();
    		} else {
    			extension = extension.toUpperCase();
    		}
    		
    		logger.debug('2. extension  ' +extension);
    		var alternateImageName = srcImagePath.substring(0,lastIndexOfDot);
    		alternateImageName = alternateImageName  + extension;
    		logger.debug('alternateImageName ' + alternateImageName);
    		lwip.open(alternateImageName , function(err, image) {
    			if(err) {
    				res.end('Error uploading --------->');
    			}    			
    			image.resize(340, function(err, image) {
    				logger.debug('image.resize for alternate image');
    	    		if(err) {
    	    			res.end('Error uploading alternateImageName#resize ' + alternateImageName);
    	    		}
    	    		image.writeFile(thumbnailImagePath, function(err) {
    	    			logger.debug('image.writeFile');
    	    			if (err) {
    	    				res.end('Error uploading alternateImageName#writeFile ' + alternateImageName);
    	    			}
    	    			logger.debug('Thumbnail created');
    	    			var newImage = new Image();
    	    			newImage.user = req.user;
    	    			newImage.name = alternateImageName;
    	    			newImage.save(function(err, newImage) {
    		                 if (err) {
    		                	 res.end('Error uploading alternateImageName#save ' + alternateImageName);
    		                 } 
    		                 res.end('Successfully uploaded ' + alternateImageName);  
    		             });    	    			 	    			
    	    		});
    	    	}); 
    		});		
    		
    	}
    	logger.debug('resize');
    	if(lwipImage !== undefined) {
    		lwipImage.resize(340, function(err, image) {
    			logger.debug('image.resize');
	    		if(err) {
	    			logger.error('lwipImage.resize#err');
	    			res.end('Unable to upload#resize ' + imageName);
	    		}
	    		image.writeFile(thumbnailImagePath, function(err) {
	    			logger.debug('image.writeFile');
	    			if (err) {
	    				logger.error('lwipImage.resize#writeFile err');
	    				res.end('Unable to upload ' + imageName);
	    			}
	    			logger.debug('Thumbnail created');
	    			var newImage = new Image();
	    			newImage.user = req.user;
	    			newImage.name = imageName;
	    			newImage.save(function(err, newImage) {
		                 if (err) {
		                	 logger.error('lwipImage.resize#writeFile#save err');
			    			 res.end('Unable to upload lwipImage.resize#writeFile#save err ' + imageName);
		                 }
		                 logger.debug('newImage.save');
		                 res.end('Sucessfully uploaded ' + imageName);
		             });	    			
	    		});
	    	});  	 
    	}
    });
}

 
 
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
