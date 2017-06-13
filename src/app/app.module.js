(function () {
    'use strict';

	var app = angular.module('prontomed', [
        'ui.router',
        'ngMessages',
        'ngMask',
        'ngAria',
        'ngAnimate',
        'ngMaterial',
        'prontomed.widgets',
        'prontomed.services'
	]);

    var firebase_config = {
        apiKey: "AIzaSyBzDiyTHO9njsSuzHfGiHCuR0FJzsveL-I",
        authDomain: "prontomed-be7cc.firebaseapp.com",
        databaseURL: "https://prontomed-be7cc.firebaseio.com",
        projectId: "prontomed-be7cc",
        storageBucket: "prontomed-be7cc.appspot.com",
        messagingSenderId: "447224824218"
      };

    var firebaseApp = firebase.initializeApp(firebase_config);

    //CONSTANTS
    app.constant('FIREBASE_APP', firebaseApp);
    app.constant('$ROUTE_DICT', {
        searchPatient: 'portal.searchPatient',
        searchDoctor: 'portal.searchDoctor'
    });

    //CONFIGS
	app.config(function ($stateProvider, $locationProvider) {
        $locationProvider.hashPrefix('');

        $stateProvider.state('anon', {
            abstract: true,
            templateUrl: 'app/shareds/anon.layout.html'
        })
    });

    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('error-toast');
        $mdThemingProvider.theme('success-toast');
        $mdThemingProvider.theme('alert-toast');
        $mdThemingProvider.theme('info-toast');
    });

    //RUNS
    app.run(function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    });

})();