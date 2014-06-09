<?php
	
	header('Content-Type: text/html; charset=utf-8');
	
	$postdata = file_get_contents("php://input");
	$Request = json_decode($postdata);
	
	eval('include_once("core/'.$_GET['object'].'.php");');
	eval('$'.$_GET['object'].' = new '.$_GET['object'].'();');

	eval('echo json_encode($'.$_GET['object'].'->'.$_GET['method'].'($Request));');

?>