var app = angular.module('phpGodfatherApp', ['ngDragDrop']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
            {
                controller: 'MainCTRL',
                templateUrl: './html/main.html'
            })
        
        .when('/project/:fileName',
            {
                controller: 'PanelCTRL',
                templateUrl: './html/panel.html'
            })
        
        .otherwise({ redirectTo: '/' });
});