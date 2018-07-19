(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('recordController', recordController)
        .controller('recordEditController', recordEditController)
        .controller('recordListController', recordListController)
        .factory('recordService', recordService)
        .config(recordConfig);

    recordController.$inject = ['$scope', '$state', 'toastService', 'recordService', '$ROUTE_DICT', 'accountService', 'authFirebaseService'];
    recordEditController.$inject = ['$scope', '$state', '$timeout', '$mdDialog', '$ROUTE_DICT', 'toastService', 'recordService', 'record'];
    recordListController.$inject = ['$scope', '$state', '$timeout', '$mdDialog', '$ROUTE_DICT', 'toastService', 'recordService', 'records', 'patient'];
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

        $stateProvider.state('portal.listRecords', {
            url: '/list/record/patient/:id',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/record/list.patient.record.html', 
                    controller: 'recordListController',
                    resolve: {
                        records : function ($stateParams, recordService) {
                            return recordService.getRecordList($stateParams.id, true);
                        },
                        patient : function ($stateParams, accountService) {
                            return accountService.getPatientAccount($stateParams.id);
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

        $scope.requestExam = function (cpf, reason, date, history){
            var userLogged = authFirebaseService.isLoggedIn();
            var promise = recordService.createRecord(userLogged.crm, cpf, reason, date, history);
            promise.then(function(record){
                $state.go($ROUTE_DICT.createExam, { id : record.getKey() });
                toastService.showSuccessMessage("Registro salvo com sucesso!");
            }, function(error){
                toastService.showErrorMessage("Desculpe, houve um erro e já estamos cientes, tente novamente mais tarde.");
            });
        };
    };

    function recordEditController($scope, $state, $timeout, $mdDialog, $ROUTE_DICT, toastService, recordService, record){
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

        $scope.removeRecord = function (id, event) {
            var confirm = $mdDialog.confirm()
                  .title('Confirma a exclusão deste registro?')
                  .textContent('Todos os dados relacionados a este registro serão apagados.')
                  .ariaLabel('Atenção')
                  .targetEvent(event)
                  .ok('Sim')
                  .cancel('Não, desfazer operação')
                  .theme('red');

            $mdDialog.show(confirm).then(function() {
                var promise = recordService.removeRecord(id);

                promise.then(function(){
                    toastService.showSuccessMessage("Registro excluído com sucesso");
                    $state.go($ROUTE_DICT.searchPatient);
                }, function(error){
                    toastService.showErrorMessage("Não conseguimos salvar a atualização, tente novamente.");
                });
            });
        };

        $scope.editExam = function (id, reason, history) {
            var promise = recordService.updateRecord($scope.record.id, reason, history);

            promise.then(function(record){
                toastService.showSuccessMessage("Registro salvo com sucesso!");
                $state.go($ROUTE_DICT.editExam);
            }, function(error){
                toastService.showErrorMessage("Não conseguimos salvar a atualização, tente novamente.");
            });
        };
    };

    function recordListController($scope, $state, $timeout, $mdDialog, $ROUTE_DICT, toastService, recordService, records, patient){
        $scope.messages = {};
        $scope.records = records;
        $scope.patient = patient;

        setTimeout(function () {
            $scope.$apply(function () {
                $scope.records = records;
                if(records.length == 0 ) {
                    toastService.showInfoMessage("Nenhum registro de prontuário foi encontrado!");
                }
            })}, 1000); 
    };

    function recordService(FIREBASE_APP, accountService){
        var service = this;
        var database = FIREBASE_APP.database();

        service.createRecord = _createRecord;
        service.updateRecord = _updateRecord;
        service.getRecord = _getRecord;
        service.removeRecord = _removeRecord;
        service.getRecordList = _getRecordList;

        function _createRecord (crm, cpf, reason, date, history) {
            var recordsRef = database.ref('records/');
            var identifiercrm = crm.replace(/\-/g,"").replace(/\./g,"");
            var identifiercpf = cpf.replace(/\-/g,"").replace(/\./g,"");

            var record = {
                'crm': identifiercrm,
                'cpf': identifiercpf,
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

        function _getRecordList (cpf, includeDoctor) {
            var identifier = cpf.replace(/\-/g,"").replace(/\./g,"");
            var recordsRef = database.ref('/records/');
            var records = [];

            return recordsRef.orderByChild('cpf').equalTo(identifier.toString()).once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var record = {
                        'id': childSnapshot.key,
                        'crm': childSnapshot.val().crm,
                        'cpf': childSnapshot.val().cpf,
                        'reason': childSnapshot.val().reason,
                        'date': childSnapshot.val().date,
                        'history': childSnapshot.val().history                       
                };

                if (includeDoctor == true) {
                        var promise = accountService.getDoctorAccount(record.crm);
                        promise.then(function(doctor){
                            record.doctor = doctor;
                        }, function(error){
                            throw error;
                        });
                }
                records.push(record);
              });
            }).then(function(data) {
                return records;
            }, function (error){
                throw error;
            });
        };

        function _removeRecord (id) {
            var recordsRef = database.ref('records/' + id);

            return recordsRef.remove();
        };

        return service;
    };

})();