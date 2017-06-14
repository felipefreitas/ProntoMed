(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('recordController', recordController)
        .factory('recordService', recordService)
        .config(recordConfig);

    recordController.$inject = ['$scope', 'FIREBASE_APP', 'accountService', '$state', 'toastService', 'authFirebaseService'];
    recordService.$inject = ['FIREBASE_APP'];

    function recordConfig($stateProvider){

        $stateProvider.state('portal.createRecord', {
            url: '/create/record',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/medicalrecord/create.record.html', 
                    controller: 'recordController'
                }
            }
        })
    };

    function recordController($scope, FIREBASE_APP, accountService, $state, toastService, authFirebaseService){
        $scope.messages = {};
        
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

        $scope.signupDoctor = function(name, lastname, identifier, specialist, password){
            var promise = accountService.getDoctorAccount(identifier);

            promise.then(function(account){
                if (account) {
                    $scope.messages['accountExistent'] = true;
                } else {
                    var promise = accountService.signupDoctor(name, lastname, identifier, specialist, password);

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
                    toastService.showInfoMessage("Nenhum registro encontrado!");
                }

                $scope.$apply();
            }, function(error){
                toastService.showErrorMessage("Estamos tendo problemas em nossos servidores :(. Tente novamente.");
            });
        };

        $scope.searchDoctor = function(data, type) {
            var promise = accountService.getDoctorAccountList(data, type);

            promise.then(function(doctors){
                $scope.doctors = doctors;

                if ($scope.doctors.length == 0) {
                    toastService.showInfoMessage("Nenhum registro encontrado!");
                }

                $scope.$apply();
            }, function(error){
                toastService.showErrorMessage("Estamos tendo problemas em nossos servidores :(. Tente novamente.");
            });
        };
    };

    function recordService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.getDoctorAccount = _getDoctorAccount;
        service.getPatientAccount = _getPatientAccount;
        service.getPatientAccountList = _getPatientAccountList;
        service.getDoctorAccountList = _getDoctorAccountList;
        service.signupDoctor = _signupDoctor;
        service.deleteDoctor = _deleteDoctor;
        service.signupPatient = _signupPatient;
        service.updatePatient = _updatePatient;
        service.updateDoctor = _updateDoctor;
        service.removePatient = _removePatient;
        service.removeDoctor = _removeDoctor;

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

        function _getDoctorAccountList (data, type){
            var doctorsRef = database.ref('/accounts/doctors/');

            return doctorsRef.orderByChild(type).startAt(data.toString()).once('value').then(function(data) {
                var doctors = [];
                $.each(data.val(),function(){
                    var doctor = {
                        'name': this.name,
                        'lastname': this.lastname,
                        'specialist': this.specialist.toString(),
                        'crm': this.crm
                    }

                    doctors.push(doctor);
                });

                return doctors;
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

        function _updatePatient (cpf, name, lastname, birthday, partner) {
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var patientsRef = database.ref('accounts/patients/' + identifier);
            
            var patient = {
                'name': name,
                'lastname': lastname,
                'birthday': birthday,
                'partner': partner,
            };

            return patientsRef.update(patient);
        };

        function _updateDoctor (crm, name, lastname, specialist) {
            var identifier = crm.replace(/\-/g,"").replace(/\./g,"");
            var doctorsRef = database.ref('accounts/doctors/' + identifier);
            
            var doctor = {
                'name': name,
                'lastname': lastname,
                'specialist': specialist
            };

            return doctorsRef.update(doctor);
        };

        function _removePatient (cpf) {
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var patientsRef = database.ref('accounts/patients/' + identifier);

            return patientsRef.remove();
        };

        function _removeDoctor (crm) {
            var identifier = crm.replace(/\-/g,"").replace(/\./g,"");
            var doctorsRef = database.ref('accounts/doctors/' + identifier);

            return doctorsRef.remove();
        };

        return service;
    };

})();