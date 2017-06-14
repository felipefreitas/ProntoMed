(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('recordController', recordController)
        .factory('recordService', recordService)
        .config(recordConfig);

    recordController.$inject = ['$scope', '$state', 'toastService', 'recordService', '$ROUTE_DICT'];
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

    function recordController($scope, $state, toastService, recordService, $ROUTE_DICT){
        $scope.messages = {};
        
        $scope.createRecord = function(cpf, reason, date, history){
            var crm = null; // TODO: get crm from user logged
            var promise = recordService.createRecord(crm, cpf, reason, date, history);
            promise.then(function(record){
                $state.go($ROUTE_DICT.searchPatient);
                toastService.showErrorMessage("Registro salvo com sucesso!");
            }, function(error){
                toastService.showErrorMessage("Desculpe, houve um erro e já estamos cientes, tente novamente mais tarde.");
            });
        };
    };

    function recordService(FIREBASE_APP){
        var service = this;
        var database = FIREBASE_APP.database();

        service.createRecord = _createRecord;

        function _createRecord (crm, cpf, reason, date, history) {
            var recordsRef = database.ref('records/');
            
            var record = {
                'crm': crm,
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