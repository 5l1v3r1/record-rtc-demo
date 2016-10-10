<?php
/**
 * Move uploaded file from temporary folder
 * into uploads directory
 */

if (isset($_FILES["audio-blob"])) {
    $uploadDirectory = __DIR__ . '/uploads/' . $_POST["audio-filename"];
    
    move_uploaded_file($_FILES["audio-blob"]["tmp_name"], $uploadDirectory);
}

die;