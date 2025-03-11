<?php

include 'db_config.php';

header('Content-Type: application/json');

$userWallet = $_POST['walletAddress'] ?? null; // Wallet recibida por POST
$ownedSkins = [];

// Si hay una wallet, obtenemos las skins compradas
if ($userWallet) {
    $queryOwned = "SELECT skin_name FROM skins_owned WHERE wallet_address = :wallet";
    $stmtOwned = $pdo->prepare($queryOwned);
    $stmtOwned->bindParam(':wallet', $userWallet, PDO::PARAM_STR);
    if (!$stmtOwned->execute()) { // Verifica si la ejecución falla
        print_r($stmtOwned->errorInfo()); // Imprime información del error
        exit; // Detiene la ejecución del script
    }
    $ownedSkins = $stmtOwned->fetchAll(PDO::FETCH_COLUMN) ?: []; // Asegurar que sea un array
}

// Obtener todas las skins y sus precios
$query = "SELECT skin_name, price FROM skins_prices ORDER BY `index` ASC";
$stmt = $pdo->query($query);
$skins = $stmt->fetchAll(PDO::FETCH_ASSOC);

$skinsData = [];

foreach ($skins as $row) {
    $skin = $row['skin_name'];
    $price = $row['price'];
    $isOwned = in_array(trim(strtolower($skin)), array_map('trim', array_map('strtolower', $ownedSkins))) || $price == 0;

    $skinsData[] = [
        'name' => $skin,
        'price' => $price,
        'owned' => $isOwned
    ];
}

echo json_encode($skinsData);
?>