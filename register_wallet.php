<?php

error_reporting(E_ALL); // Mostrar todos los errores, advertencias y avisos
ini_set('display_errors', 1); // Mostrar errores directamente en pantalla
ini_set('display_startup_errors', 1); // Mostrar errores de inicio de PHP

# VALIDAMOS QUE SEA UN POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = array("success" => false, "error" => "Método no permitido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

# OBTENEMOS LA DATA QUE ENVIA EL CLIENTE
$data = json_decode(file_get_contents('php://input'), true);

# PHP INICIA SESION
session_start();

# VERIFICAMOS QUE LA DATA ENVIADA ESTÉ
if (!isset($data['wallet'])) {
    $response = array("success" => false, "error" => "Falta la dirección de la wallet");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// VALIDAMOS CSRF TOKEN
if (!isset($data['csrf']) || $data['csrf'] !== $_SESSION['csrf']) {
    $response = array("success" => false, "error" => "Token CSRF inválido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

$wallet = $data['wallet'];

include_once 'solana_utils.php';

# VALIDACION DE WALLET A TRAVES DE LA API DE SOLSCAN!!!!!
if (!validateSolanaWallet($wallet)) {
    $response = array("success" => false, "error" => "Wallet inválida");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

# INICIAMOS CONEXION A LA DB
include_once 'db_config.php';

$checkQuery = "SELECT * FROM flappy_frog_highscores WHERE wallet_address = ?";
$stmt = $pdo->prepare($checkQuery);
$stmt->bindParam(1, $wallet);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if (is_array($result) && array_key_exists('id', $result)) {
    $response = array("success" => true, "message" => "Wallet already registered.");
} else {
    $sql = "INSERT INTO flappy_frog_highscores (wallet_address) VALUES (?)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(1, $wallet);
    $stmt->execute();
    $response = array("success" => true, "message" => "Wallet address registered successfully!");
}

header('Content-Type: application/json');
echo json_encode($response);

?>