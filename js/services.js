app.service('projectService', function ($http) {

    var project = {};

    var activeClass = null;

    var selectedPaneIndex = 0;

    this.getActiveClass = function () {
        return activeClass;
    }

    this.setActiveClass = function (index) {
        activeClass = index;
        //console.log(activeClass);
    }

    this.getSelectedPaneIndex = function () {
        return selectedPaneIndex;
    }

    this.setSelectedPaneIndex = function (index) {
        selectedPaneIndex = index;
        //console.log(selectedPaneIndex);
    }

    this.createProject = function (MyProject) {
        var Project = MyProject;
        return $http.post('./php/bridge.php?object=Project&method=createProject', Project);
    }

    this.projectsList = function () {
        return $http.post('./php/bridge.php?object=Project&method=projectsList').then(function(result) {return result.data;});
    }

    this.deleteClass = function(index){
        project.classes.splice(index, 1);
    }

    this.getProject = function (fileName) {
        return $http.post('./php/bridge.php?object=Project&method=loadProject', {"file":fileName});
    }

    this.saveProject = function (fileName) {
        project.modified.push(this.getTime());
        return $http.post('./php/bridge.php?object=Project&method=saveProject', {"file":fileName, "project":project});
    };

    this.deleteProject = function (MyProject) {
        return $http.post('./php/bridge.php?object=Project&method=deleteProject', MyProject);
    };

    this.generateClass = function (MyClass) {
        var Object = {};
        Object.name = project.name;
        Object.class = MyClass
        return $http.post('./php/bridge.php?object=Project&method=generateClass', Object);
    };

    this.generateAllClasses = function () {
        return $http.post('./php/bridge.php?object=Project&method=generateAllClasses', project);
    };
    
    this.refreshTables = function (project) {
        return $http.post('./php/bridge.php?object=Project&method=getTables', project);
    }
    
    this.createMySQLConnectFile = function (project) {
        return $http.post('./php/bridge.php?object=Project&method=createMySQLConnectFile', project);
    }
    
    

    this.setProject = function (MyProject) {
        project = MyProject;
    };

    this.getMethodTypes = function () {
        return methodTypes;
    }

    this.getTime = function () {
        var date = new Date();
        var Year = ""+date.getFullYear();
        var Month = date.getMonth()+1;
        Month+="";
        if(Month.length==1){Month="0"+Month}
        var Day = ""+date.getDate();
        if(Day.length==1){Day="0"+Day}
        var Hours = ""+date.getHours();
        if(Hours.length==1){Hours="0"+Hours}
        var Minutes = ""+date.getMinutes();
        if(Minutes.length==1){Minutes="0"+Minutes}
        var Seconds = ""+date.getSeconds();
        if(Seconds.length==1){Seconds="0"+Seconds}
        var Time = Year+"-"+Month+"-"+Day+" "+Hours+":"+Minutes+":"+Seconds;
        return Time;
    }

    var methodTypes = [
      {"title":"SELECT query", "name":"mysql-select", "group":"MySQL"},
      {"title":"INSERT INTO query", "name":"mysql-insert-into", "group":"MySQL"},
      {"title":"UPDATA query", "name":"mysql-update", "group":"MySQL"},
      {"title":"DELETE query", "name":"mysql-delete", "group":"MySQL"},
    ];

    

});