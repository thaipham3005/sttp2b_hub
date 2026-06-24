<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/data.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode(["categories" => []]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        // Basic validation - check if it has 'categories' array
        if (isset($input['categories']) && is_array($input['categories'])) {
            file_put_contents($dataFile, json_encode($input, JSON_PRETTY_PRINT));
            echo json_encode(["success" => true, "message" => "Data saved successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid data format"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
?>
