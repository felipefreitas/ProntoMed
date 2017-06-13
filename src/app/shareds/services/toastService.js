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
        };

        function _showAlertMessage (message){
        };

        function _showInfoMessage (message){
        };

        return service;
    };

})();