(function () {
    'use strict';

	var app = angular.module('prontomed', [
		'ui.router'
	]);

	app.config(function ($stateProvider, $locationProvider) {
        $locationProvider.hashPrefix('');

        $stateProvider.state('anon', {
            abstract: true,
            templateUrl: 'app/shareds/anon.layout.html'
        })
    });

})();