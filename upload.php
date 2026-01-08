<?php
$targetDir = "uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$targetFile = $targetDir . uniqid() . ".jpg";

if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetFile)) {
    echo "Photo uploaded!";
} else {
    http_response_code(500);
    echo "Upload failed";
}
?>
