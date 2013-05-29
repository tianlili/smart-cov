<?php
    header("application/x-www-form-urlencoded");
    $filename = 'data/'.$_POST["name"].'.html';
    
    if(!$_POST["name"]){
    	echo "No file";
        exit;
    }

    if (get_magic_quotes_gpc()==1){
    	$somecontent=stripcslashes($_POST["html"]);       
	}else{
	    $somecontent = $_POST["html"];
	}
	
    if (!$handle = fopen($filename, 'a')) {
         echo "Cannot open $filename";
         exit;
    }

    if (fwrite($handle, $somecontent) === FALSE) {
        echo "Cannot write to $filename";
        exit;
    }

    echo "Written successfully";

    fclose($handle);
?>
