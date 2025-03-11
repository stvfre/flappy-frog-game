<?php

include 'db_config.php';

$walletAddress = $_GET['wallet_address'];

# Sanitizamos un poco el $walletAddress
$walletAddress = filter_var($walletAddress, FILTER_SANITIZE_STRING);
$walletAddress = htmlspecialchars($walletAddress);

// Consulta a la base de datos
$sql = "SELECT score FROM flappy_frog_highscores WHERE wallet_address = :walletAddress";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':walletAddress', $walletAddress);
$stmt->execute();
$highScore = $stmt->fetch(PDO::FETCH_ASSOC);

// Devolver el resultado en formato JSON
header('Content-Type: application/json');
echo json_encode($highScore);
?>