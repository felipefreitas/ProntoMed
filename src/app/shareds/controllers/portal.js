(function (){
	'use strict';

	angular
		.module('prontomed')
		.controller('portalController', portalController)
		.config(portalConfig);

    portalController.$inject = ['$scope', 'FIREBASE_APP', '$state'];

	function portalConfig($stateProvider){
		$stateProvider.state('portal', {
            abstract: true,
            templateUrl: 'app/shareds/portal.layout.html',
            data: {
                includeFooter: true,
                background: 'portalBody'
            },
            controller: 'portalController'

        })
	};

    function portalController($scope, FIREBASE_APP, $state){
        $scope.messages = {};

    };

})();