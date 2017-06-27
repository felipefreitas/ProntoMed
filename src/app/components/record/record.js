(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('recordController', recordController)
        .factory('recordService', recordService)
        .config(recordConfig);

    recordController.$inject = ['$scope', '$state', 'toastService', 'recordService', '$ROUTE_DICT', 'accountService', 'authFirebaseService'];
    recordService.$inject = ['FIREBASE_APP'];

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

    function recordService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.createRecord = _createRecord;

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

        return service;
    };

})();