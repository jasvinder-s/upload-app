var serviceModule = angular.module('angularService', []);

serviceModule.factory('ImageService', ['$http', '$log', function($http, $log) {
	$log.debug("angularService#ImageService initialized");
	var o = {
		images: [],
		userImages: []
	}; 
	 	
	o.getThumbnails = function() {
		$log.debug('ImageService#getThumbnails');
		return $http.get('/thumbnails').success(function(data){
			$log.debug('success');	
			angular.copy(data, o.images);			 
		    });
	};
	
	o.getProfile = function(user) {
		$log.debug('ImageService#getProfile' + user);
		return $http.get('/profile', {user: user}).success(function(data){
			$log.debug('angularService # getProfile success data');
			angular.copy(data, o.userImages);
			$log.debug('angularService # getProfile success o.userImages');
		});
	}
	return o; 	  
}]);

// Auth service for handling user login
serviceModule.factory('AuthService', ['$q', '$timeout', '$http', '$state','$log',
  function ($q, $timeout, $http, $state, $log) {
	
    var userLoggedIn = null;
    var user = null;
    
    var errMessage;
    
    function isLoggedIn() {
	  if(userLoggedIn) {
	    return true;
	  } else {
	    return false;
	  }
	}
    
    function getUserStatus() {
	  return userLoggedIn;
	}
    
    function login(email, password) {
    	// create a new instance of deferred
    	var deferred = $q.defer();

    	// send a post request to the server
    	$http.post('/login', {email: email, password: password})
    		// handle success
    	    .success(function (data, status) {
    	    	if(status === 200 && data.status){
    	    		userLoggedIn = true;
    	    		user = data.user;
    	    		deferred.resolve();
    	    		$state.go('profile');    	    		
    	    	} else {
    	    		userLoggedIn = false; 
    	    		deferred.reject();
    	    		return;
    	    	}
    	    })
    	    // handle error
    	    .error(function (data) {
    	    	userLoggedIn = false;
    	    	deferred.reject();
    	    	return;
    	     });
    	     return deferred.promise;
    }
    
    function signup(email, password) {
    	// create a new instance of deferred
    	var deferred = $q.defer();

    	// send a post request to the server
    	$http.post('/signup', {email: email, password: password})
    		// handle success
    	    .success(function (data, status) {
    	    	if(status === 200 && data.status){
    	    		userLoggedIn = true;
    	    		user = data.user;
    	    		$state.go('profile');
    	    		deferred.resolve();	
    	    	} else {
    	    		$log.debug('angularService#success else');
    	    		userLoggedIn = false;
    	    		user = null;
    	    		errMessage = data;
    	    		deferred.reject();
    	    	}
    	    })
    	    // handle error
    	    .error(function (data) {
    	    	$log.debug('angularService#signup error');
    	    	userLoggedIn = false;
    	    	user = null;
    	    	errMessage = data;
    	    	//$state.go('signup',{}, { reload: true });
    	    	$state.go('signup');
    	    	deferred.reject();
    	     }); 
    	     // return promise object
    	     return deferred.promise;
    	}
    
    function getUser() {
    	return user;
    }
    
    function getErrMessage() {
    	return errMessage;
    }
     
    // return available functions for use in controllers
    return ({
    	isLoggedIn: isLoggedIn,
    	getUserStatus: getUserStatus,
    	login: login,
    	signup: signup,
    	getUser: getUser,
    	getErrMessage: getErrMessage
    });
}]);

serviceModule.config(function($logProvider){
	$logProvider.debugEnabled(true);
});
