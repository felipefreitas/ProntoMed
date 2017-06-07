(function (){
	'use strict';

	angular
		.module('prontomed')
		.controller('accountController', accountController)
        .factory('accountService', accountService)
		.config(accountConfig);

    accountController.$inject = ['$scope', 'FIREBASE_APP', 'accountService', '$state'];
    accountService.$inject = ['FIREBASE_APP'];

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

    function accountController($scope, FIREBASE_APP, accountService, $state){
        $scope.messages = {};

        $scope.login = function (identifier, password){
            var account = {};

            if (type == 'doctor') {
                account = accountService.getDoctorAccount(identifier);

                if (account) {
                    $state.go('portal.doctor');
                } else {

                }

            } else if (type == 'patient') {
                account = accountService.getPatientAccount(identifier);

                if (account) {
                    $state.go('portal.patient');
                }
            }

            if (!account) {
                $scope.messages['not-existent'] = {};
            }
        };

        $scope.signupPatient = function(name, lastname, birthday, partner, identifier, password){
            var promise = accountService.getPatientAccount(identifier);

            promise.then(function(account){
                if (account) {
                    $scope.messages['accountExistent'] = true;
                } else {
                    var promise = accountService.signupPatient(name, lastname, birthday, partner, identifier, password);

                    promise.then(function(account){
                        $scope.messages['createdSuccess'] = true;
                        $scope.$apply();
                    }, function(error){
                        $scope.messages['serverFailed'] = true;
                        $scope.$apply();
                    });
                }
                $scope.$apply();
            }, function(error){
                $scope.messages['serverFailed'] = true;
                $scope.$apply();
            });
        };

        $scope.signupDoctor = function(name, lastname, identifier, speciallity, password){
            var promise = accountService.getDoctorAccount(identifier);

            promise.then(function(account){
                if (account) {
                    $scope.messages['accountExistent'] = true;
                } else {
                    var promise = accountService.signupDoctor(name, lastname, identifier, speciallity, password);

                    promise.then(function(account){
                        $scope.messages['createdSuccess'] = true;
                        $scope.$apply();
                    }, function(error){
                        $scope.messages['serverFailed'] = true;
                        $scope.$apply();
                    });
                }
                $scope.$apply();
            }, function(error){
                $scope.messages['serverFailed'] = true;
                $scope.$apply();
            });
        };

    };

    function accountService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.getDoctorAccount = _getDoctorAccount;
        service.getPatientAccount = _getPatientAccount;
        service.signupDoctor = _signupDoctor;
        service.deleteDoctor = _deleteDoctor;
        service.signupPatient = _signupPatient;

        function _getDoctorAccount (crm){
            var doctorsRef = database.ref('/accounts/doctors/' + crm);

            return doctorsRef.once('value').then(function(data) {
                if (data.val()) {
                    var doctor = {
                        'crm': data.key,
                        'name': data.val().name,
                        'lastname': data.val().lastname,
                        'specialist': data.val().specialist,
                        'password': data.val().password
                    };
                    return doctor;
                }
            }, function (error){
                throw error;
            });
        };

        function _getPatientAccount (cpf){
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var patientsRef = database.ref('/accounts/patients/' + identifier);

            return patientsRef.once('value').then(function(data) {
                if (data.val()) {
                    var patient = {
                        'cpf': data.key,
                        'name': data.val().name,
                        'lastname': data.val().lastname,
                        'birthday': data.val().birthday,
                        'partner': data.val().partner,
                        'password': data.val().password
                    };
                    return patient;
                }
            }, function (error){
                throw error;
            });
        };

        function _signupDoctor (name, lastname, crm, specialist, password) {
            var doctorsRef = database.ref('accounts/doctors/' + crm);
            
            var doctor = {
                'name': name,
                'lastname': lastname,
                'crm': crm,
                'specialist': specialist,
                'password': password
            };

            return doctorsRef.set(doctor);
        };

        function _deleteDoctor (crm) {
            var doctorsRef = database.ref('accounts/doctors/' + crm);

            return doctorsRef.unset();
        };

        function _signupPatient (name, lastname, birthday, partner, cpf, password) {
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var patientsRef = database.ref('accounts/patients/' + identifier);
            
            var patient = {
                'name': name,
                'lastname': lastname,
                'birthday': birthday,
                'partner': partner,
                'cpf': identifier,
                'password': password
            };

            return patientsRef.set(patient);
        };

        return service;
    };

})();