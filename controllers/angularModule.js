var app = angular.module('ImageGalleryApp', ['ngAnimate', 'ui.bootstrap', 'angularService', 'ui.router', 'ngFileUpload']);
app.controller('ModalController', function($scope, $uibModal, $log, ImageService, AuthService, $state, $log) {
	//$log.debug('ModalController initialized');
    
	$scope.animationsEnabled = true;
	
	// Login / Signup related
	$scope.error = false;
	$scope.errorMessage = "";
	$scope.disabled = false;
	$scope.loginForm = {};
	$scope.signupForm = {};	
	
	$scope.user = AuthService.getUser();
	$log.debug($scope.user);
	
	$scope.items = ImageService.images;
	 
	ImageService.getProfile($scope.user);
	$scope.userImages = ImageService.userImages;
	
	$scope.state = $state;
	 
	$scope.open = function (items, index) {
	    $log.debug('index ' + index);	     
	    $scope.index = index;
	     
	    var modalInstance = $uibModal.open({
	      animation: $scope.animationsEnabled,
	      templateUrl: 'modalContent.html',
	      controller: 'ModalInstanceCtrl',	
	      scope: $scope,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        },
	        index: function() {
	        	return $scope.index;
	        }
	      }   
	    });   
	};
		  
  $scope.login = function () {
	  $log.debug('$scope.login ');
	   
      $scope.error = false;
      $scope.disabled = true;
      
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        // handle success
        .then(function () {
	         $scope.disabled = false;
	         $scope.loginForm = {};
	          
	         $scope.user = AuthService.getUser();
	         $log.debug('angularModal# $scope.login then ') ;
	         $log.debug( $scope.user);
	          
	         ImageService.getProfile($scope.user);
	         $scope.userLoggedIn = true;
          
        })
        // handle error
        .catch(function () {
        	$log.debug('$scope.login catch');
        	$log.debug('$scope 2');
        	$log.debug($scope);
        	$scope.error = true;
        	$scope.errorMessage = "Invalid username and/or password";
        	$scope.disabled = false;
        	$scope.loginForm = {};
        });

    };
    
    $scope.signup = function () {
    	$log.debug('angularModel#signup');
    	// initial values
    	$scope.error = false;
    	$scope.disabled = true;
    	
    	 if($scope.signupForm.password != $scope.signupForm.repeatPassword) {
       	  $scope.error = true;
             $scope.disabled = false;
             $scope.errorMessage = "Passwords do not match";
             return;
         }

    	AuthService.signup($scope.signupForm.username, $scope.signupForm.password)
    		// handle success
    		.then(function () {
    			$log.debug('angularModel#signup then');
    			$scope.disabled = false;
    			$scope.signupForm = {};
    			$scope.user = AuthService.getUser();
		    })
	        // handle error
	        .catch(function () {
	        	//$log.debug('angularModulel#signup catch');
	        	$scope.signupForm = {};
	        	$scope.error = true;
	        	$scope.errorMessage = AuthService.getErrMessage().err;
	        	if($scope.errorMessage == 'Missing credentials') {
	        		$scope.errorMessage = 'Please enter valid email';
	        	}
	        	$log.debug($scope.errorMessage);
	        	$scope.disabled = false;
	        });
    	};
});

// $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items, index, $log) {
	$log.debug('index ' + index);
  
  	$scope.items = items;
	  
  	$scope.selected = {
	    item: $scope.items[index]
  	};
	  
  	$scope.items = {
  			images: items
	};
	  
	$scope.index = index;
	  
	$scope.ok = function () {
		$scope.index = $scope.index + 1;
		$log.debug('ok ' + $scope.index)
	};
	
	$scope.cancel = function () {
	    $uibModalInstance.dismiss('cancel');
	};
	  
	$scope.next = function () {
		$scope.index = $scope.index + 1;	     
	};
	  
	$scope.previous = function () {		   
		$scope.index = $scope.index - 1;		   
	};
});

app.controller('UploadCtrl', ['$scope', 'Upload', '$timeout','$q','$log', function ($scope, Upload, $timeout, $q, $log) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    
    $scope.log = '';

    $scope.upload = function (files) {
    	$log.debug('angularModule#scope.upload');   	 
    	if(files && files.length) {
    		var i = 0;
    		function next(i) {    			
    			file=files[i];
    			Upload.upload({                     
                    url: "/api/photo",
                    encType: "multipart/form-data",
                    file: file
                }).progress(function (evt) {
                	//$scope.log += "Uploading..." + evt.config.file.name;
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                    	evt.config.file.name + '\n' + $scope.log;
                }).then(function(data, status, headers, config){ 
                	i++;
                	$log.debug('angularModule#then');
                	if( i < files.length) {
                		next(i);
                	}                	
                  });
    		}
    		next(i);
    	}   	 
    };  
   
}]);

//ui-router is based on the state of application and not on site URL
app.config(['$stateProvider','$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
		$stateProvider
	    	.state('home', {
		      url: '/home',
		      templateUrl: './partials/home.ejs',
		      controller: 'ModalController',
		      resolve: {
		    	    postPromise: ['ImageService', function(ImageService){
		    	      return ImageService.getThumbnails();
		    	    }]
		    	  }
		    })
		    .state('login', {
		        url: '/login',
		        templateUrl: './partials/login.ejs'
		     })
		     .state('profile', {
		        url: '/profile',
		        templateUrl: './partials/profile.ejs',
		        controller: 'ModalController',
		        resolve: {
		    	    postPromise: ['ImageService', function(ImageService){
		    	      return ImageService.getThumbnails();
		    	    }]
		    	  } 
		     })
		     .state('signup', {
		          url: '/signup',
		          templateUrl: './partials/signup.ejs'
		     })
		     .state('upload', {
		          url: '/upload',
		          templateUrl: './partials/upload.ejs',
		          controller: 'UploadCtrl'
		     }) 
    $urlRouterProvider.otherwise('home');  
}]);

