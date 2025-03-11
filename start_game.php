<?php
include 'db_config.php';
session_start();

// Verificar si el método de la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = array("success" => false, "error" => "Método no permitido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Obtener los datos enviados
$data = json_decode(file_get_contents('php://input'), true);
$wallet_address = $data['wallet_address'];

// Validar CSRF token
if (!isset($data['csrf']) || $data['csrf'] !== $_SESSION['csrf']) {
    $response = array("success" => false, "error" => "Token CSRF inválido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Verificar si existe la wallet
$sql = "SELECT * FROM flappy_frog_highscores WHERE wallet_address = ?";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(1, $wallet_address);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    $response = array("success" => false, "error" => "Wallet no registrada");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Actualizar game_start_time
$sql = "UPDATE flappy_frog_highscores SET game_start_time = CURRENT_TIMESTAMP, games_played = games_played + 1 WHERE wallet_address = ?";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(1, $wallet_address);

if ($stmt->execute()) {
    $response = array("success" => true);
} else {
    $response = array("success" => false, "error" => "Error al actualizar");
}

header('Content-Type: application/json');
echo json_encode($response);
?>