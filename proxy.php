<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$url = "https://api.devnet.solana.com/";

// Leer datos de la solicitud
$data = file_get_contents("php://input");

// **Depuración**: Ver si el request llega correctamente
file_put_contents("proxy_log.txt", "Request recibido:\n" . $data . "\n\n", FILE_APPEND);

if (!$data || json_decode($data) === null) {
    http_response_code(400);
    echo json_encode(["error" => "Solicitud inválida: JSON no válido"]);
    exit;
}

// Inicializar cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

// Ejecutar la petición y capturar errores
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// **Depuración**: Ver la respuesta de Solana
file_put_contents("proxy_log.txt", "Respuesta de Solana:\n" . $response . "\n\n", FILE_APPEND);

// Manejo de errores de cURL
if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Fallo en la conexión con Solana RPC", "detalle" => $error]);
    exit;
}

// Si la respuesta no es 200, enviar un error
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(["error" => "Error en Solana RPC", "detalle" => $response]);
    exit;
}

// **Depuración**: Confirmar envío de respuesta válida
file_put_contents("proxy_log.txt", "Respuesta enviada al cliente:\n" . $response . "\n\n", FILE_APPEND);

// Enviar la respuesta válida
echo $response;
?>