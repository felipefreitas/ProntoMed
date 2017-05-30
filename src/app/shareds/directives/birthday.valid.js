(function(){
	'use strict';

	angular
		.module('prontomed.widgets', ['prontomed'])
		.directive('lessToday', [lessToday])

	function lessToday() {
		  	return {
			    restrict: 'A',
			    require: 'ngModel',
			    link: function(scope, elm, attrs, ctrl) {

					scope.$watch(attrs.lessToday, function(value) {
						
						if (value) {
							var birthdayString = value;
							var birthday = new Date(birthdayString.split('/', 3)[2], birthdayString.split('/', 3)[1]-1, birthdayString.split('/', 3)[0]);
							var today = new Date();

							if (today > birthday) {
								ctrl.$setValidity('less-today', true);
							} else {
								ctrl.$setValidity('less-today', false);
							}
						}
					});

					ctrl.$parsers.push(function(viewValue) {
						return viewValue;
					});

					ctrl.$formatters.push(function(modelValue) {
						return modelValue;
					});
			      
			    }
	  		};
	};
})();