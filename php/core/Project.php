<?php
	header('Content-Type: text/html; charset=utf-8');
	include_once("Helper.php");
	
class Project extends Helper{

		function __construct(){
			
		}

		function createProject($Request){
			$link = mysqli_connect($Request->host, $Request->user, $Request->password);
			if(mysqli_select_db($link, $Request->database)==1){
				
                $Request->tables = $this->getTables($Request);
                
                $result["saveProjectFile"] = is_numeric(file_put_contents("../projects/".$this->generateName().".json",json_encode($Request),1));
                
                $result["createMySQLConnectFile"] = $this->createMySQLConnectFile($Request);
				
				return $result;
				
			}
			else{
				return false;
			}
        }
        
        function getTables($Request){
            $link = mysqli_connect($Request->host, $Request->user, $Request->password);
			if(mysqli_select_db($link, $Request->database)==1){
				$i = 0;
                $Request->tables = array();
				$tables = mysqli_query($link, "SHOW TABLES FROM ".$Request->database);
				while($table=mysqli_fetch_array($tables)){
					$Request->tables[$i] = new stdClass();
					$Request->tables[$i]->name = $table[0];
					$j = 0;
					$fields = mysqli_query($link, "SHOW COLUMNS FROM ".$table[0]);
					while($field=mysqli_fetch_array($fields)){
						$Request->tables[$i]->fields[$j] = $field[0];
						$j++;
					}
					$i++;
				}
                return $Request->tables;
            }
            else { return false; }
        }
    
        function createProjectFolder($Request){
            if(!file_exists("../projects/".$Request->name)){
                return  mkdir("../projects/".$Request->name, 0700);
            }
            else{ return true; }
        }
    
        function createMySQLConnectFile($Request){
            $this->createProjectFolder($Request);
            
            $phpCode = "<?php\n";
            $phpCode .= "\tdefine( \"DATABASE_SERVER\", \"".$Request->host."\");\n";
            $phpCode .= "\tdefine( \"DATABASE_USERNAME\", \"".$Request->user."\");\n";
            $phpCode .= "\tdefine( \"DATABASE_PASSWORD\", \"".$Request->password."\");\n";
            $phpCode .= "\tdefine( \"DATABASE_NAME\", \"".$Request->database."\");\n"; 
            $phpCode .= "?>";
            
            return is_numeric(file_put_contents("../projects/".$Request->name."/MySQLConnect.php",$phpCode,1));
        }

		function saveProject($Request){
			return is_numeric(file_put_contents("../projects/".$Request->file,json_encode($Request->project),1));
		}

		function loadProject($Request){
			return json_decode(file_get_contents("../projects/".$Request->file));
		}

        function deleteProject($Request){
			$result["deleteProjectFolder"] = $this->deleteFolder("../projects/".$Request->name);
			$result["deleteProjectFile"] = unlink(realpath("../projects/".$Request->file));
			return $result;
		}

		function projectsList(){
            $projectFiles = array();
			$projectFiles = scandir("../projects/");
			$length = count($projectFiles);
			$projectsList = array();
            $project = "";
			$j = 0;
			for ($i=0; $i < $length; $i++) {
				if(!is_dir($projectFiles[$i])&&strpos($projectFiles[$i],".json")){
                    $projectsList[$j] = new stdClass();
					$projectsList[$j]->file = $projectFiles[$i];
					$project = file_get_contents("../projects/".$projectFiles[$i]);
					$project = json_decode($project);
					$projectsList[$j]->name = $project->name;
					$projectsList[$j]->date = end($project->modified);
					$j++;
				}
			}

			return $projectsList;
		}

		function generateClass($Request){
			$phpCode = "<?php\n";
			$phpCode .= "\trequire_once('MySQLConnect.php');\n\n";
			
			if($Request->class->description!=""){
                $phpCode .= "\t/**\n";
                $phpCode .= "\t* ".$Request->class->description."\n";
                $phpCode .= "\t*/\n";
			}
			
			$phpCode .= "\tclass ".$Request->class->name."{\n";
			
			for($i=0;$i<count($Request->class->variables);$i++){
				$phpCode .= "\t\tvar $".$Request->class->variables[$i]->name." = \"".$Request->class->variables[$i]->value."\";\n";
				
			}

			$phpCode .= "\t\t\n";
			$phpCode .= "\t\t/**\n";
		    $phpCode .= "\t\t* This is constructor method.\n";
		    $phpCode .= "\t\t*/\n";
	    	$phpCode .= "\t\tfunction __construct(){\n";
	    	$phpCode .= "\t\t\tmysql_connect(DATABASE_SERVER,DATABASE_USERNAME,DATABASE_PASSWORD);\n";
	    	$phpCode .= "\t\t\tmysqli_select_db(DATABASE_NAME);\n";
	    	$phpCode .= "\t\t\tmysqli_query(\"SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'\");\n";
			$phpCode .= "\t\t}\n";

	    	$phpCode .= "\t\t\n";
			for($i=0;$i<count($Request->class->methods);$i++){
				if($Request->class->methods[$i]->description!=""){
                    $phpCode .= "\t\t/**\n";
                    $phpCode .= "\t\t* ".$Request->class->methods[$i]->description."\n";
                    $phpCode .= "\t\t*/\n";
                }
			    $functionParam = "";
			    $query = "\"";
			    switch($Request->class->methods[$i]->basedOn){
					case 'mysql-select':
							$query .= "SELECT ";
							for ($j=0; $j < count($Request->class->methods[$i]->select); $j++) { 
								$query .= $Request->class->methods[$i]->select[$j].", ";
							}
							$query = trim($query,", ");
							$query .= " FROM ".$Request->class->methods[$i]->from[0]." ";
							if(count($Request->class->methods[$i]->where)>0){
                                $query .= " WHERE ";
                                if($Request->class->methods[$i]->sendObject){
                                    $functionParam .= "$"."Object";
                                }
                                for ($j=0; $j < count($Request->class->methods[$i]->where); $j++) {
                                    if($Request->class->methods[$i]->sendObject){
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$"."Object->".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable)."' AND ";
                                    }
                                    else{
                                        $functionParam .= "$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable).", ";
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable)."' AND ";
                                    }
                                }
                            }
							$query = trim($query," AND ");
						break;
						
					case 'mysql-insert-into':
							$query .= "INSERT INTO ".$Request->class->methods[$i]->insertInto[0]." (";
							for ($j=0; $j < count($Request->class->methods[$i]->columns); $j++) {
								$query .= $Request->class->methods[$i]->columns[$j].", ";
							}
							$query = trim($query,", ");
							$query .= ") VALUES (";
							if($Request->class->methods[$i]->sendObject){
                                $functionParam .= "$"."Object";
                            }
							for ($j=0; $j < count($Request->class->methods[$i]->values); $j++) {
								if($Request->class->methods[$i]->sendObject){
                                    $query .= "'$"."Object->".$this->prepareVariable($Request->class->methods[$i]->values[$j])."', ";
                                }
                                else{
								    $functionParam .= "$".$this->prepareVariable($Request->class->methods[$i]->values[$j]).", ";
								    $query .= "'$".$this->prepareVariable($Request->class->methods[$i]->values[$j])."', ";
                                }
							}
							$query = trim($query,", ");
							$query .= ")";
						break;
						
					case 'mysql-update':
							$query .= "UPDATE ".$Request->class->methods[$i]->update[0];
							
							$query .= " SET ";
							
							if($Request->class->methods[$i]->sendObject){
                                $functionParam .= "$"."Object";
                            }
							for ($j=0; $j < count($Request->class->methods[$i]->set); $j++) {
								if($Request->class->methods[$i]->sendObject){
                                    $query .= $Request->class->methods[$i]->set[$j]->field." = '$"."Object->".$this->prepareVariable($Request->class->methods[$i]->set[$j]->variable,"set")."', ";
                                }
                                else{
                                    $functionParam .= "$".$this->prepareVariable($Request->class->methods[$i]->set[$j]->variable,"set").", ";
								    $query .= $Request->class->methods[$i]->set[$j]->field." = '$".$this->prepareVariable($Request->class->methods[$i]->set[$j]->variable,"set")."', ";
                                }
							}
							
							$query = trim($query,", ");
							if(count($Request->class->methods[$i]->where)>0){
                                $query .= " WHERE ";
                                for ($j=0; $j < count($Request->class->methods[$i]->where); $j++) {
                                    if($Request->class->methods[$i]->sendObject){
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$"."Object->".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable,"where")."' AND ";
                                    }
                                    else{
                                        $functionParam .= "$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable,"where").", ";
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable,"where")."' AND ";
                                    }
                                }
                            }
							$query = trim($query," AND ");
						break;

					case 'mysql-delete':
							$query .= "DELETE FROM ".$Request->class->methods[$i]->deleteFrom[0];
							if(count($Request->class->methods[$i]->where)>0){
                                $query .= " WHERE ";
                                if($Request->class->methods[$i]->sendObject){
                                    $functionParam .= "$"."Object";
                                }
                                for ($j=0; $j < count($Request->class->methods[$i]->where); $j++) {
                                    if($Request->class->methods[$i]->sendObject){
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$"."Object->".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable)."' AND ";
                                    }
                                    else{
                                        $functionParam .= "$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable).", ";
                                        $query .= $Request->class->methods[$i]->where[$j]->field." = '$".$this->prepareVariable($Request->class->methods[$i]->where[$j]->variable)."' AND ";
                                    }
                                }
							}
							$query = trim($query," AND ");
						break;

					default:
						return false;
						break;
				}

				$query .= ";\"";
				$functionParam = trim($functionParam,", ");

				$phpCode .= "\t\tfunction ".$Request->class->methods[$i]->name."(".$functionParam."){\n";
				$phpCode .= "\t\t\treturn mysqli_query(".$query.");\n";
				$phpCode .= "\t\t}\n\n";
			}
			$phpCode .= "\t}\n";
			$phpCode .= "?>";

			return is_numeric(file_put_contents("../projects/".$Request->name."/".$Request->class->name.".php",$phpCode,1));
		}
		
		function generateAllClasses($Request){
            $Result;
            $this->createMySQLConnectFile($Request);
            for ($i=0; $i < count($Request->classes); $i++) { 
                $Result[$i]->class = $Request->classes[$i]->name;
                $Object = new stdClass();
                $Object->name = $Request->name;
                $Object->class = $Request->classes[$i];
                $Result[$i]->status = $this->generateClass($Object);
            }
            return $Result;
        }

	}
?>