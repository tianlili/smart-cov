<?php
	$seconds = 315360000; // 10 years
	$now = $expires = time();
	$filepath = $_GET[ "file" ];
	$expires += $seconds;

	if( preg_match( "/\.php/", $filepath ) )
		die( "no found!" );

	header( "Last-Modified: " . gmdate( 'D, d M Y H:i:s T', $now ) );
	header( "Expires: " . gmdate( 'D, d M Y H:i:s T', $expires ) );
	header( "Cache-Control: max-age=" . $seconds );

	if( preg_match( "/\.css/", $filepath ) )
		header("Content-Type: text/css");
	else if(preg_match("/\.js/i", $filepath))
		header("Content-Type: text/javascript");
	else if(preg_match("/\.gif/", $filepath))
		header("Content-Type: image/gif");
	else if(preg_match("/\.jpg/", $filepath))
		header("Content-Type: image/jpeg");

	if( preg_match( "/gzip/", $_SERVER[ "HTTP_ACCEPT_ENCODING" ] ) !== false &&
		is_file( $filepath . ".gz") ){
		$filepath = $filepath . ".gz";
		header( "Content-Encoding: gzip" );
	}

	readfile( $filepath );
?>