<?php

function isValidAddress($address) {
    return preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $address);
}

function validateSolanaWallet($walletAddress) {

    if ( $_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
        return true;
    }
    if (!isValidAddress($walletAddress)) {
        return ["success" => false, "message" => "Formato de wallet inválido"];
    }

    $url = "https://api.solscan.io/account?address=" . $walletAddress;

    $apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzQ0NTA5NzEwNjAsImVtYWlsIjoidmVnYWZyZWlyZXRvbWFzQGdtYWlsLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczNDQ1MDk3MX0.bjsFC_oZE9Z4zed_c70qwM5tzYanFFS22H4_b9kg3OQ"; // Reemplaza con tu clave de API

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "accept: application/json",
        "token: $apiKey"
    ]);

    $response = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpStatus === 200) {
        $data = json_decode($response, true);
        if (!empty($data)) {
            return ["success" => true, "message" => "Valid wallet", "data" => $data];
        }
    } else {
        return ["success" => false, "message" => "Error validating the wallet", "http" => $httpStatus];
    }
    return ["success" => false, "message" => "The wallet is not valid or was not found"];
}