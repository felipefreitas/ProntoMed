(function (){
	'use strict';

	angular
		.module('prontomed.auth', ['prontomed'])
        .factory('authFirebaseService', authFirebaseService);

    authFirebaseService.$inject = ['FIREBASE_APP', 'accountService'];

    function authFirebaseService(FIREBASE_APP, accountService){
        var service = this;
        var auth = FIREBASE_APP.auth();

        service.generateToken = function (id){
            //TODO: call server to generate token for custom authentication
        };

        service.login = function (identifier, password) {
            var isDoctor = identifier.includes('BR');
            if (isDoctor == true) {
                var promise = accountService.getDoctorAccount(identifier);
                return promise.then(function(account){
                    if (account) {
                        if (account.password == password) {
                            account.type = 'doctor';
                            service.currentUser = account;
                            return account;
                        } else {
                            throw 'loginFailed';
                        }
                    } else {
                        throw 'accountNotExistent';
                    }
                }, function(error){
                    throw 'failedSystem';
                });
            } else {
                var promise = accountService.getPatientAccount(identifier);
                return promise.then(function(account){
                    if (account) {
                        if (account.password == password) {
                            account.type = 'patient';
                            service.currentUser = account;
                            return account;
                        } else {
                            throw 'loginFailed';
                        }
                    } else {
                        throw 'accountNotExistent';
                    }                    
                }, function(error){
                    throw 'failedSystem';
                });
            }
        };

        service.isLoggedIn = function() {
                return (service.currentUser) ? service.currentUser : false;
        };

        service.logout = function () {
            service.currentUser = null;
        };

        return service;
    };

})();