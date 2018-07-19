(function (){
    'use strict';

    angular
        .module('prontomed')
        .controller('examController', examController)
        .factory('examService', examService)
        .config(examConfig);

    examController.$inject = ['$scope', '$state', 'exams', 'record', 'examService', 'toastService'];
    examService.$inject = ['FIREBASE_APP', 'accountService'];

    function examConfig($stateProvider){

        $stateProvider.state('portal.createExam', {
            url: '/create/exam/record/:id',
            views: {
                'header': { templateUrl: 'app/shareds/portal.header.html' },
                'content': { 
                    templateUrl: 'app/components/exam/create.exam.html', 
                    controller: 'examController',
                    resolve: {
                        exams : function ($stateParams, examService) {
                            return examService.getExamList($stateParams.id);
                        },
                        record : function ($stateParams, recordService) {
                            return recordService.getRecord($stateParams.id, false, true);
                        }
                    }
                }
            }
        })
    };

    function examController($scope, $state, exams, record, examService, toastService){
        $scope.messages = {};
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.exams = exams;
                $scope.record = record;
            });
        }, 200);
        

        $scope.createExam = function(description, result, recordId){
            if (result == null) {
                result = "Aguardando"
            }
            var promise = examService.createExam(recordId, description, result);
            promise.then(function(exam){
                var exam = {
                    'recordId': recordId,
                    'description': description,
                    'result': result
                };
                toastService.showSuccessMessage("Registro salvo com sucesso!");
                $scope.exams.push(exam);
            }, function(error){
                toastService.showErrorMessage("Desculpe, houve um erro e já estamos cientes, tente novamente mais tarde.");
            });
        };
    };

    function examService(FIREBASE_APP, accountService){
        var service = this;
        var database = FIREBASE_APP.database();

        service.createExam = _createExam;
        service.getExamList = _getExamList;

        function _createExam (recordId, description, result) {
            var examsRef = database.ref('exams/');

            var exam = {
                'recordId': recordId,
                'description': description,
                'result': result
            };

            return examsRef.push(exam);
        };

        function _getExamList (id){
            var examsRef = database.ref('/exams/');
            var exams = [];

            return examsRef.orderByChild('recordId').startAt(id.toString()).once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var exam = {
                        'id': childSnapshot.key,
                        'description': childSnapshot.val().description,
                        'result': childSnapshot.val().result,
                        'recordId': childSnapshot.val().recordId,
                };
                exams.push(exam);
              });
            }).then(function(data) {
                return exams;
            }, function (error){
                throw error;
            });
        };

        function _removeExam (id) {
            var examsRef = database.ref('exams/' + id);

            return examsRef.remove();
        };

        return service;
    };

})();