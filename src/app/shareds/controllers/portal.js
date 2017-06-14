(function (){
	'use strict';

	angular
		.module('prontomed')
		.controller('portalController', portalController)
		.config(portalConfig);

    portalController.$inject = ['$scope', '$state', 'FIREBASE_APP', 'authFirebaseService', '$ROUTE_DICT'];

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

    function portalController($scope, $state, FIREBASE_APP, authFirebaseService, $ROUTE_DICT){
        $scope.messages = {};

        $scope.logout = function (){
            authFirebaseService.logout();
            $state.go($ROUTE_DICT.login);
        };
    };

})();