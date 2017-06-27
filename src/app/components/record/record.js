(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('recordController', recordController)
        .controller('recordEditController', recordEditController)
        .factory('recordService', recordService)
        .config(recordConfig);

    recordController.$inject = ['$scope', '$state', 'toastService', 'recordService', '$ROUTE_DICT', 'accountService', 'authFirebaseService'];
    recordEditController.$inject = ['$scope', '$state', '$timeout', '$ROUTE_DICT', 'toastService', 'recordService', 'record'];
    recordService.$inject = ['FIREBASE_APP', 'accountService'];

    function recordConfig($stateProvider){

        $stateProvider.state('portal.createRecord', {
            url: '/create/record',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/record/create.record.html', 
                    controller: 'recordController'
                }
            }
        })

        $stateProvider.state('portal.editRecord', {
            url: '/edit/record/:id',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/record/edit.record.html', 
                    controller: 'recordEditController',
                    resolve: {
                        record : function ($stateParams, recordService) {
                            return recordService.getRecord($stateParams.id, true, true);
                        }
                    }
                }
            }
        })
    };

    function recordController($scope, $state, toastService, recordService, $ROUTE_DICT, accountService, authFirebaseService){
        $scope.messages = {};
        
        $scope.createRecord = function(cpf, reason, date, history){
            var userLogged = authFirebaseService.isLoggedIn();
            var promise = recordService.createRecord(userLogged.crm, cpf, reason, date, history);
            promise.then(function(record){
                $state.go($ROUTE_DICT.searchPatient);
                toastService.showSuccessMessage("Registro salvo com sucesso!");
            }, function(error){
                toastService.showErrorMessage("Desculpe, houve um erro e já estamos cientes, tente novamente mais tarde.");
            });
        };

        $scope.searchPatient = function(cpf) {
            var promise = accountService.getPatientAccount(cpf);
            promise.then(function(patient){
                $scope.record.patient.name = patient.name;
                $scope.record.patient.birthday = patient.birthday;
                var birthday = new Date($scope.record.patient.birthday.split('/',3)[2] + ' ' + $scope.record.patient.birthday.split('/',3)[1] + ' ' + $scope.record.patient.birthday.split('/',3)[0]);
                var today = new Date();
                $scope.record.patient.age = today.getFullYear() - birthday.getFullYear();
                $scope.$apply();
            }, function(error){
                toastService.showErrorMessage("Estamos tendo problemas em nossos servidores :(. Tente novamente.");
            });
        };
    };

    function recordEditController($scope, $state, $timeout, $ROUTE_DICT, toastService, recordService, record){
        $scope.messages = {};
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.record = record;
                var birthday = new Date($scope.record.patient.birthday.split('/',3)[2] + ' ' + $scope.record.patient.birthday.split('/',3)[1] + ' ' + $scope.record.patient.birthday.split('/',3)[0]);
                var today = new Date();
                $scope.record.patient.age = today.getFullYear() - birthday.getFullYear();
            });
        }, 200);

        $scope.editRecord = function(id, reason, history) {
             var promise = recordService.updateRecord($scope.record.id, reason, history);

            promise.then(function(record){
                toastService.showSuccessMessage("Registro salvo com sucesso!");
                $state.go($ROUTE_DICT.searchPatient);
            }, function(error){
                toastService.showErrorMessage("Não conseguimos salvar a atualização, tente novamente.");
            });
        };
    };

    function recordService(FIREBASE_APP, accountService){
        var service = this;
        var database = FIREBASE_APP.database();

        service.createRecord = _createRecord;
        service.updateRecord = _updateRecord;
        service.getRecord = _getRecord;

        function _createRecord (crm, cpf, reason, date, history) {
            var recordsRef = database.ref('records/');
            var identifier = crm.replace(/\-/g,"").replace(/\./g,"");

            var record = {
                'crm': identifier,
                'cpf': cpf,
                'reason': reason,
                'date': date,
                'history': history
            };

            return recordsRef.push(record);
        };

        function _updateRecord (id, reason, history) {
            var recordsRef = database.ref('records/' + id);
            
            var record = {
                'reason': reason,
                'history': history
            };

            return recordsRef.update(record);
        };

        function _getRecord (id, includeDoctor, includePatient){
            var recordsRef = database.ref('/records/' + id);

            return recordsRef.once('value').then(function(data) {
                if (data.val()) {
                    var record = {
                        'id': data.key,
                        'crm': data.val().crm,
                        'cpf': data.val().cpf,
                        'reason': data.val().reason,
                        'date': data.val().date,
                        'history': data.val().history
                    };

                    if (includeDoctor == true) {
                        var promise = accountService.getDoctorAccount(record.crm);
                        promise.then(function(doctor){
                            record.doctor = doctor;
                        }, function(error){
                            throw error;
                        });
                    }

                    if (includePatient == true) {
                        var promise = accountService.getPatientAccount(record.cpf);
                        promise.then(function(patient){
                            record.patient = patient;
                        }, function(error){
                            throw error;
                        });
                    }
                    
                    return record;
                }
            }, function (error){
                throw error;
            });
        };

        return service;
    };

})();