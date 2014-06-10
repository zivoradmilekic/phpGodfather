app.controller('MainCTRL', function ($scope, projectService, $timeout) {

    init();

    function init() {
        $scope.newProject = {"name":"", "host":"", "user":"", "password":"", "database":""};
        $scope.projectsList = projectService.projectsList();
        console.log($scope.projectsList);
        $scope.notification = {"text":""};
        $scope.alert = {"text":""};
        
        $scope.showProjectForm = {"show":true};
        $scope.showProjectsList = {"show":true};
    }

    $scope.createProject = function(){
        var Project = {};
        Project.name = $scope.newProject.name;
        Project.host = $scope.newProject.host;
        Project.user = $scope.newProject.user;
        Project.password = $scope.newProject.password;
        Project.database = $scope.newProject.database;
        Project.created = projectService.getTime();
        Project.modified = [];
        Project.modified[0] = projectService.getTime();
        Project.tables = [];
        Project.classes = [];
        projectService.createProject(Project).then(function(result){

            if(result.data.createMySQLConnectFile && result.data.saveProjectFile){
                $scope.showNotification("Project "+Project.name+" is successfully created!");
                $scope.projectsList = projectService.projectsList();
                $scope.newProject = {"name":"", "host":"", "user":"", "password":"", "database":""};
            }else{
                $scope.showAlert("Project "+Project.name+" is not created! Check your data!");
            };
        });
        
    }

    $scope.deleteProject = function(MyProject){
        projectService.deleteProject(MyProject).then(function(result){
            if(result.data.deleteProjectFile && result.data.deleteProjectFolder){
                $scope.projectsList = projectService.projectsList();
                $scope.showNotification("Project "+MyProject.name+" is successfully deleted! ");
            }else{
                $scope.showAlert("Project "+MyProject.name+" is not deleted!");
            };
        });
            
    }

    $scope.toggleCreateProject = function(){
        $scope.showProjectForm.show=!$scope.showProjectForm.show;
    }

    $scope.toggleProjectsList = function(){
        $scope.showProjectsList.show=!$scope.showProjectsList.show;
    }

    $scope.showNotification = function(Text){
        $scope.notification.text=Text;
        $timeout(function(){$scope.notification.text=""}, 2000);
    }

    $scope.showAlert = function(Text){
        $scope.alert.text=Text;
    }

    $scope.hideAlert = function(){
        $scope.alert.text="";
    }
 
});


app.controller('PanelCTRL', function ($scope, $routeParams, $timeout, projectService) {

    init();

    function init() {
        $scope.fileName = $routeParams.fileName;

        $scope.project = projectService.getProject($scope.fileName).then(function(result){
            $scope.project=result.data;
            projectService.setProject($scope.project);
        });
        

        $scope.methodTypes = projectService.getMethodTypes();
        $scope.notification = {"text":""};
        $scope.alert = {"text":""};
        $scope.variablePopUp = {"show":false};
        $scope.methodPopUp = {"show":false};
        $scope.projectPopUp = {"show":false};

        $scope.newClass = {"name":"","description":""};
        $scope.newVariable = {"name":"","value":""};
        $scope.newMethod = {"name":"","basedOn":{},"description":""};
    }

    $scope.saveProject = function(){
        projectService.saveProject($scope.fileName).then(function(result){
            if(result.data=="true"){
                $scope.showNotification("Project "+$scope.project.name+" is successfully saved!");
            }else{
                $scope.showAlert("Project "+$scope.project.name+" is not saved!");
            }
        });
    }

    $scope.showNotification = function(Text){
        $scope.notification.text=Text;
        $timeout(function(){$scope.notification.text=""}, 2000);
    }

    $scope.showAlert = function(Text){
        $scope.alert.text=Text;
    }

    $scope.hideAlert = function(){
        $scope.alert.text="";
    }

    $scope.removeElement = function(array, index) {
        array.splice(index, 1);
    }
    
    $scope.removeAllElement = function(array) {
        array.splice(0, array.length);
    }
    
    $scope.refreshTables = function(){
        projectService.refreshTables($scope.project).then(function(result){
            console.log(result);
            if(result.data != "false"){
                $scope.project.tables = result.data;
                $scope.showNotification("Tables are successfully updated!");
            }else{
                $scope.showAlert("Tables are not updated!");
            }
        });
    }
    
    $scope.createMySQLConnectFile = function(){
        projectService.createMySQLConnectFile($scope.project).then(function(result){
            console.log(result);
            if(result.data != "false"){
                $scope.showNotification("MySQLConnect.php is successfully created!");
            }else{
                $scope.showAlert("MySQLConnect.php is not created!");
            }
        });
    }
    

    $scope.generateClass = function(MyClass){
        projectService.generateClass(MyClass).then(function(result){
            if(result.data=="true"){
                $scope.showNotification("Class "+MyClass.name+" is successfully generated!");
            }else{
                $scope.showAlert("Class "+MyClass.name+" is not generated!");
            }
        });
    }

    $scope.generateAllClasses = function(){
        projectService.generateAllClasses().then(function(result){
            console.log(result);
            ungeneratedClasses=[];
            angular.forEach(result.data, function(myClass) {
                if(!myClass.status){
                    ungeneratedClasses.push(myClass.class);
                }
            });
            

            if(ungeneratedClasses.length==0){
                $scope.showNotification("All classes in project "+$scope.project.name+" are successfully generated!");
            }else{
                text = "Class generation is not complite! Class";
                if(ungeneratedClasses.length>1){
                    text += "es";
                }
                text += " ";
                for(i=0;i<ungeneratedClasses.length;i++) {
                    text += ungeneratedClasses[i];
                    if(i+2==ungeneratedClasses.length){
                        text += " and ";
                    }
                    else if(i+1==ungeneratedClasses.length){
                        text += " ";
                    }
                    else{
                        text += ", ";
                    }
                };
                if(ungeneratedClasses.length>1){
                    text += "are";
                }
                else{
                    text += "is";
                }
                text += " not generated!";
                $scope.showAlert(text);
            }
        });
    }

    $scope.deleteMethod = function(index){
        $scope.project.classes[projectService.getActiveClass()].methods.splice(index, 1);
    }

    $scope.deleteVariable = function(index){
        $scope.project.classes[projectService.getActiveClass()].variables.splice(index, 1);
    }

    $scope.toggleMethod = function(method){
        method.show=!method.show;
    }

    $scope.toggleTable = function(table){
        table.show=!table.show;
    }

    $scope.toggleVariablePopUp = function(clasS){
        $scope.variablePopUp.show=!$scope.variablePopUp.show;
        $scope.newVariable = {"name":"","value":""};
    }

    $scope.toggleMethodPopUp = function(clasS){
        $scope.methodPopUp.show=!$scope.methodPopUp.show;
        $scope.newMethod = {"name":"","basedOn":{},"description":""};
    }
    
    $scope.toggleProject = function(){
        $scope.projectPopUp.show=!$scope.projectPopUp.show;
    }

    $scope.toggleSendObject = function(method){
        method.sendObject=!method.sendObject;
    }

    $scope.createClass = function(){
        var Class = {};
        Class.name = $scope.newClass.name;
        Class.description = $scope.newClass.description;
        Class.variables = [];
        Class.methods = [];

        $scope.project.classes.push(Class);

        $scope.newClass.name="";
        $scope.newClass.description="";
        
    }

    $scope.addVariable = function(){
        var Variable = {};
        Variable.name = $scope.newVariable.name;
        Variable.value = $scope.newVariable.value;
        
        $scope.project.classes[projectService.getActiveClass()].variables.push(Variable);

        $scope.newVariable.name="";
        $scope.newVariable.value="";
    }

    $scope.addMethod = function(){
        var Method = {};
        Method.name = $scope.newMethod.name;
        Method.description = $scope.newMethod.description;
        Method.basedOn = $scope.newMethod.basedOn.name;
        Method.sendObject = false;
        if (Method.basedOn=="mysql-select"){
            Method.select=[];
            Method.from=[];
            Method.where=[];
        }
        else if (Method.basedOn=="mysql-insert-into"){
            Method.insertInto=[];
            Method.columns=[];
            Method.values=[];
        }
        else if (Method.basedOn=="mysql-update"){
            Method.update=[];
            Method.set=[];
            Method.where=[];
        }
        else if (Method.basedOn=="mysql-delete"){
            Method.deleteFrom=[];
            Method.where=[];
        }
        else{
            
        };

        $scope.project.classes[projectService.getActiveClass()].methods.push(Method);

        $scope.newMethod = {"name":"","basedOn":{},"description":""};

    }

    $scope.printProject = function() {
        console.log($scope.project);
    }
    

    
});


