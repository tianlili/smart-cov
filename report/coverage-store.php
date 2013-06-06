<?php
    header("application/x-www-form-urlencoded");
    
    if($_POST["name"]){
    	$filename = $_POST["name"];
    } else {
    	$filename = "coverage.json";
    }

    if (get_magic_quotes_gpc()==1){
    	$somecontent=stripcslashes($_POST["content"]);       
	} else {
	    $somecontent = $_POST["content"];
	}

	$datadir = "./data/";
	if(!file_exists ($datadir))
		if(!mkdir ($datadir, 0777)){
			echo "Cannot make direcroty $datadir";
         	exit;
		}

	$filepath = $datadir.$filename;
	    
    if (!$handle = fopen($filepath, 'w')) {
         echo "Cannot open $filepath";
         exit;
    }

    if (fwrite($handle, $somecontent) === FALSE) {
        echo "Cannot write to $filepath";
        exit;
    }

    echo "Success";

    fclose($handle);
?>
