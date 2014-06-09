app.directive('tabs', function() {
	return {
	  restrict: 'E',
	  transclude: true,
	  scope: {},
	  controller: function($scope, $element, projectService) {
		var panes = $scope.panes = [];

		$scope.select = function(pane, index) {
			if (index!=undefined) {projectService.setSelectedPaneIndex(index);};
			angular.forEach(panes, function(pane) {
				pane.selected = false;
			});
			pane.selected = true;

			if(index>0){
				projectService.setActiveClass(index-1);
			};			
		}

		$scope.removePane = function(index) {
			selectedTab = projectService.getSelectedPaneIndex();
			panes.splice(index, 1);
			projectService.deleteClass(index-1);

			angular.forEach(panes, function(pane) {
				pane.selected = false;
			});

			if(selectedTab==index){
				projectService.setSelectedPaneIndex(index-1);
				panes[index-1].selected = true;
			}else if(selectedTab<index){
				projectService.setSelectedPaneIndex(selectedTab);
				panes[selectedTab].selected = true;
			}
			else{
				projectService.setSelectedPaneIndex(selectedTab-1);
				panes[selectedTab-1].selected = true;
			}			
		}

		this.addPane = function(pane) {
			if (panes.length == 0) $scope.select(pane);
			panes.push(pane);
		}
	},
	template:
		'<div class="classesMainPanel">'+
			'<header class="classesMain">'+
				'<div ng-repeat="pane in panes">'+
					'<button class="white" ng-class="{whiteActive:pane.selected}" ng-click="select(pane, $index)" >'+
						'<div class="icon" ng-if="$index==0" style="margin-right: 5px;">'+
							'<i class="iconAdd"></i>'+
						'</div>'+
						'<span>{{pane.name}}</span>'+
					'</button>'+
					'<div class="icon remove" ng-click="removePane($index)" ng-if="$index!=0" style="margin-left: 5px;">'+
						'<i class="iconRemove"></i>'+
					'</div>'+
				'</div>'+
			'</header>'+
			'<div class="classesHolder tab-content"><div ng-transclude></div></div>' +
		'</div>',
	  replace: true
	};
	
})
app.directive('pane', function() {
	return {
	  require: '^tabs',
	  restrict: 'E',
	  transclude: true,
	  scope: { name: '@' },
	  link: function(scope, element, attrs, tabsCtrl) {
		tabsCtrl.addPane(scope);
	  },
	  template:
		'<div class="class tab-pane" ng-class="{classShow: selected}" ng-transclude>' +
		'</div>',
	  replace: true
	};
});