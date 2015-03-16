<?php

$upl = $_FILES['file'];
die( json_encode( array('file_name' => $upl['name'], 'file' => $upl) ) );

?>