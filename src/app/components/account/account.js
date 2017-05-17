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

    function accountController($scope, accountService, $state){
        $scope.messages = {};

        $scope.login = function (identifier, password, type){
            var account = {};

            if (type == 'doctor') {
                account = accountService.getDoctorAccount(identifier, password);

                if (account) {
                    $state.go('portal.doctor');
                }
            } else if (type == 'patient') {
                account = accountService.getDoctorAccount(identifier, password);

                if (account) {
                    $state.go('portal.patient');
                }
            }

            if (!account) {
                $scope.messages['account-not-existent'] = {};
            }
        };
    };

    function accountService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.getDoctorAccount = _getDoctorAccount;
        service.getPatientAccount = _getPatientAccount;
        service.signupDoctor = _signupDoctor;
        service.signupPatient = _signupPatient;

        function _getDoctorAccount (crm, password){
            var doctorsRef = database.ref('accounts/doctors/' + crm);

            doctorsRef.on('value', function (data) {
                var doctor = {
                    'crm': data.key,
                    'name': data.val().name,
                    'lastname': data.val().lastname,
                    'specialist': data.val().specialist,
                    'password': data.val().password
                };

                return doctor;
            });
        };

        function _getPatientAccount (cpf, password){
            var patientsRef = database.ref('accounts/patients/' + cpf);

            patientsRef.on('value', function (data) {
                return {
                    'cpf': data.key,
                    'name': data.val().name,
                    'lastname': data.val().lastname,
                    'birthday': data.val().birthday,
                    'partner': data.val().partner
                    'password': data.val().password
                };
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

        function _signupPatient (name, lastname, birthday, partner, cpf, password) {
            var patientsRef = database.ref('accounts/patients/' + cpf);
            var patient = {
                'name': name,
                'lastname': lastname,
                'birthday': birthday,
                'partner': partner,
                'cpf': cpf,
                'password': password
            };

            return patientsRef.set(patient);
        };

        return service;
    };

})();