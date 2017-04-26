(function () {
    'use strict';

	var app = angular.module('prontomed', [
		'ui.router',
        'ngMessages'
	]);

	app.config(function ($stateProvider, $locationProvider) {
        $locationProvider.hashPrefix('');

        $stateProvider.state('anon', {
            abstract: true,
            templateUrl: 'app/shareds/anon.layout.html'
        })
    });

    app.run(function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    });

})();