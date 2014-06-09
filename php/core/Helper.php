<?php

	/**
	* 
	*/
	class Helper{
		
		function __construct(){
			# code...
		}

		function prepareJSON($table){
			$i = 0;
			while($row = mysql_fetch_assoc($table)){
			    $jsonArray[$i]=$row;
	            $i++;
			}
	        return $jsonArray;
		}
		
		function prepareVariable($string,$prefix=""){
			$result = "";
			$separator = "-";
			if (strpos($string,'_') !== false) {
                $separator = "_";
            }
			$array = explode($separator,$string);
			$result .= $prefix;
			for($i=0;$i<count($array);$i++){
			    if($i==0&&$prefix==""){
			        $result .= $array[$i];
			    }
			    else{
			        $result .= ucfirst($array[$i]);
			    }
			}
	        return $result;
		}

		function generateName(){
			$array = array(0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f");
			$length = count($array)-1;
			$name = "";
			for($j=0;$j<3;$j++){
				for($i=0;$i<10;$i++){
					$name.= $array[rand(0,$length)];
				}
				if($j<2){
					$name.= "-";
				}
			}
			return $name;
		}

		function deleteFolder($folderPath){
			$folderFiles = scandir($folderPath);
			$length = count($folderFiles);
			for ($i=0; $i < $length; $i++) {
				if(!is_dir($folderFiles[$i])&&strpos($folderFiles[$i],".")){
					unlink($folderPath."/".$folderFiles[$i]);
				}
			}
			return rmdir($folderPath);
		}
	}

?>