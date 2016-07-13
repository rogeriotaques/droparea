<?php
$upl = array_shift($_FILES);
die( json_encode( array('file_name' => $upl['name'], 'file' => $upl) ) );
?>
