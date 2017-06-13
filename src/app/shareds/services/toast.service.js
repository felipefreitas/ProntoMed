(function (){
	'use strict';

	angular
		.module('prontomed.services', ['prontomed'])
        .factory('toastService', toastService);

    toastService.$inject = ['$mdToast'];

    function toastService($mdToast){
        var service = this;

        service.showSuccessMessage = _showSuccessMessage;
        service.showErrorMessage = _showErrorMessage;
        service.showAlertMessage = _showAlertMessage;
        service.showInfoMessage = _showInfoMessage;

        function _showSuccessMessage (message){
            this.message = message;

            $mdToast.show(
              $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme('success-toast')
                .hideDelay(3000)
            );
        };

        function _showErrorMessage (message){
            this.message = message;

            $mdToast.show(
              $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme('error-toast')
                .hideDelay(3000)
            );
        };

        function _showAlertMessage (message){
            this.message = message;

            $mdToast.show(
              $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme('alert-toast')
                .hideDelay(3000)
            );
        };

        function _showInfoMessage (message){
            this.message = message;

            $mdToast.show(
              $mdToast.simple()
                .textContent(message)
                .position('top')
                .theme('info-toast')
                .hideDelay(3000)
            );
        };

        return service;
    };

})();