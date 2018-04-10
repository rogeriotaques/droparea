<?php 

/**
 * Used to minify the main source-code.
 * Excluded from git.
 */

require_once('../minifyr/minifyr.php');

$file   = $argc > 1 ? $argv[1] : false;
$debug  = false;
$screen = false;

if (!$file) {
    echo 'Missing file';
    exit;
}

$m = new RT\Minifyr($debug, $screen);
echo $m->file( $file )->uglify()->render(true);
exit;

?>