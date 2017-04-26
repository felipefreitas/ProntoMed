(function (){
	'use strict';

	angular
		.module('prontomed')
		.controller('accountController', accountController)
		.config(accountConfig);

    accountController.$inject = ['$scope'];

	function accountConfig($stateProvider){

		$stateProvider.state('anon.login', {
            url: '/login',
            views: {
                'header': { templateUrl: 'app/shareds/anon.header.html' },
                'content': { 
                    templateUrl: 'app/components/account/login.html', 
                    controller: 'accountController'
                }
            }
        })

        $stateProvider.state('anon.signupDoctor', {
            url: '/signup/doctor',
            views: {
                'header': { templateUrl: 'app/shareds/anon.header.html' },
                'content': { 
                    templateUrl: 'app/components/account/signup.doctor.html', 
                    controller: 'accountController'
                }
            }
        })

        $stateProvider.state('anon.signupPatient', {
            url: '/signup/patient',
            views: {
                'header': { templateUrl: 'app/shareds/anon.header.html' },
                'content': { 
                    templateUrl: 'app/components/account/signup.patient.html', 
                    controller: 'accountController'
                }
            }
        })
	};

    function accountController($scope){
        $scope.messages = {};

        $scope.login = function (identifier, password){
            var account = null; //TODO: Call account service.

            if (!account) {
                $scope.messages['account-not-existent'] = {};
            }
        };
    };
})();