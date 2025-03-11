<?php

include 'db_config.php';

header('Content-Type: application/json');

// Recibiendo los datos de la solicitud POST
$wallet_address = $_POST['wallet_address'] ?? '';
$skin_name = $_POST['skin_name'] ?? '';
$txid = $_POST['txid'] ?? '';

// Validar los datos recibidos
if (empty($wallet_address) || empty($skin_name) || empty($txid)) {
    echo json_encode(["success" => false, "error" => "Missing required fields."]);
    exit;
}

// Insertar la compra en la base de datos
try {
    $sql = "INSERT INTO skins_owned (wallet_address, skin_name, txid) VALUES (:wallet_address, :skin_name, :txid)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':wallet_address', $wallet_address);
    $stmt->bindParam(':skin_name', $skin_name);
    $stmt->bindParam(':txid', $txid);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Error inserting record into database."]);
    }
} catch (PDOException $e) {
    // Capturar errores en la consulta y conexión a la base de datos
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}

?>