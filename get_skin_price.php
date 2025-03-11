<?php

include 'db_config.php';

header('Content-Type: application/json');

// Obtener el personaje desde la petición GET
$character = $_GET['character'] ?? null;

if (!$character) {
    echo json_encode(["error" => "Missing character parameter"]);
    exit;
}

try {
    // Buscar el precio en la base de datos
    $stmt = $pdo->prepare("SELECT price FROM skins_prices WHERE skin_name = :character LIMIT 1");
    $stmt->execute(["character" => $character]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(["price" => round(floatval($result['price']), 6)]); // Convertir a float y redondear
    } else {
        echo json_encode(["error" => "Skin not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed"]);
}
?>