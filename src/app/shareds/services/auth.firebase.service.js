(function (){
	'use strict';

	angular
		.module('prontomed.auth', ['prontomed'])
        .factory('authFirebaseService', authFirebaseService);

    authFirebaseService.$inject = ['FIREBASE_APP'];

    function authFirebaseService(FIREBASE_APP){
        var service = this;
        var auth = FIREBASE_APP.auth();

        service.generateToken = _generateToken;

        function _generateToken (userId){
            var token = auth.createCustomToken(userId, {"premium_account": true});
        };

        return service;
    };

})();