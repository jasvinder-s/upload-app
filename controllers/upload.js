var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('UploadCtrl', ['$scope', 'Upload', '$timeout','$q', '$log',function ($scope, Upload, $timeout, $q) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';

    $scope.upload = function (files) {
    	$log.debug('scope.upload');   	 
    	if(files && files.length) {
    		var i = 0;
    		function next(i) {    			
    			file=files[i];
    			Upload.upload({                     
                    url: "/api/photo",
                    encType: "multipart/form-data",
                    file: file
                }).then(function(data, status, headers, config){
                	i++;
                	$log.debug('then');
                	if( i < files.length) {
                		next(i);
                	}                	
                  }, function(evt) {
                	  var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                      console.log('progress: ' + progressPercentage + '% ');
                	  $scope.log('progress: ' + progressPercentage + '% ');
                  });
    		}
    		next(i);
    	}   	 
    };  
   
}]);

app.config(function($logProvider){
	$logProvider.debugEnabled(true);
});