(function (app) {
  var switchDirective = [function () {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        isChecked: '=',
        elementId: '@',
        callbackFn: '&'
      },
      template: `
          <label class="switch">
          <input 
                class="switch-input"
                type="checkbox" 
                id="{{ elementId }}"
                ng-checked = "isChecked"
                ng-click="changeCheckbox()"               
        >
        <span class="switch-label" data-on="On" data-off="Off"></span> 
        <span class="switch-handle"></span> 
    </label>
      `,
      link: function ($scope) {
        $scope.elementId = $scope.elementId || 'close_blocked_tabs';
        $scope.changeCheckbox = function () {          
          $scope.isChecked = !$scope.isChecked;          
          $scope.callbackFn({option:  $scope.isChecked});                    
        }

      }
    };
  }];
  app.directive('toggleInput', switchDirective);
})(app);