(function (){
	'use strict';

	angular
		.module('prontomed')
        .controller('accountController', accountController)
		.controller('editAccountController', editAccountController)
        .factory('accountService', accountService)
		.config(accountConfig);

    accountController.$inject = ['$scope', 'FIREBASE_APP', 'accountService', '$state'];
    accountService.$inject = ['FIREBASE_APP'];
    editAccountController.$inject = ['$scope', '$state', 'accountService', 'account'];

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

        $stateProvider.state('portal.searchPatient', {
            url: '/search/patient',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/account/search.patient.html', 
                    controller: 'accountController'
                }
            }
        })

        $stateProvider.state('portal.editPatient', {
            url: '/edit/patient/:id',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/account/edit.patient.html', 
                    controller: 'editAccountController',
                    resolve: {
                        account : function ($stateParams, accountService) {
                            return accountService.getPatientAccount($stateParams.id);
                        }
                    }
                }
            }
        })
	};

    function accountController($scope, FIREBASE_APP, accountService, $state){
        $scope.messages = {};
        $scope.patients = [];

        $scope.login = function (identifier, password){
            var isDoctor = identifier.includes('BR');

            if (isDoctor == true) {
                var promise = accountService.getDoctorAccount(identifier);

                promise.then(function(account){
                    if (account) {
                        if (account.password == password) {
                            $state.go('portal.doctor');
                        } else {
                            $scope.messages['loginFailed'] = true;
                        }
                    } else {
                        $scope.messages['accountNotExistent'] = true;
                    }
                    $scope.$apply();    
                }, function(error){
                    $scope.messages['failedSystem'] = true;
                    $scope.$apply();
                });
            } else {
                var promise = accountService.getPatientAccount(identifier);

                promise.then(function(account){
                    if (account) {
                        if (account.password == password) {
                            $state.go('portal.patient');
                        } else {
                            $scope.messages['loginFailed'] = true;
                        }
                    } else {
                        $scope.messages['accountNotExistent'] = true;
                    }
                    $scope.$apply(); 
                }, function(error){
                    $scope.messages['failedSystem'] = true;
                    $scope.$apply();
                });
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

        $scope.searchPatient = function(cpf) {
            var promise = accountService.getPatientAccountList(cpf);

            promise.then(function(patients){
                $scope.patients = patients;

                if ($scope.patients.length == 0) {
                    $scope.messages['searchFailed'] = true;
                } else {
                    $scope.messages['searchFailed'] = false;
                }

                $scope.$apply();

            }, function(error){
                $scope.messages['serverError'] = true;
            });
        };
    };

    function editAccountController($scope, $state, accountService, account){
        $scope.account = account;

        $scope.editPatient = function (name, lastname, birthday, partner) {
            // TODO: call service to update register
        };

        // TODO: edit method parameters
        $scope.editDoctor = function () {
            // TODO: call service to update register
        };
    };

    function accountService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.getDoctorAccount = _getDoctorAccount;
        service.getPatientAccount = _getPatientAccount;
        service.getPatientAccountList = _getPatientAccountList;
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

        function _getPatientAccountList (cpf){
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var patientsRef = database.ref('/accounts/patients/');

            return patientsRef.orderByChild('cpf').startAt(cpf.toString()).once('value').then(function(data) {
                var patients = [];
                $.each(data.val(),function(){
                    var patient = {
                        'name': this.name,
                        'lastname': this.lastname,
                        'birthday': this.birthday,
                        'partner': this.partner,
                        'cpf': this.cpf                        
                    }

                    patients.push(patient);
                });

                return patients;
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