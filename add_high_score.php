<?php

#error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

// Incluir el archivo de configuración de la base de datos
include 'db_config.php';
include_once 'solana_utils.php';

session_start();

// Verificar si el método de la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response = array("success" => false, "error" => "Método no permitido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}



function validateScore($startTime, $score, $currentTime) {
    
    return [
        "valid" => true,
        "message" => "Score is within possible range",
        "max_possible" => 9999
    ];

    $initialPipeVelocity = 1000; // Intervalo inicial de generación de pipes en ms
    $levelIncrementPipes = 10; // Pipes necesarios para aumentar el nivel
    $minPipeVelocity = 500; // Tiempo mínimo entre pipes en ms
    
    // Calcular el tiempo transcurrido desde el inicio
    $elapsedSeconds = $currentTime - strtotime($startTime);
    
    // Verificar si el tiempo es válido
    if ($elapsedSeconds <= 0) {
        return ["valid" => false, "message" => "Invalid time period"];
    }
    
    $totalPossiblePipes = 0;
    $currentVelocity = $initialPipeVelocity;
    $currentLevel = 0;
    $pipeCounter = 0;
    $remainingTime = $elapsedSeconds; // Tiempo restante en segundos (6 segundos de ejemplo)
    
    while ($remainingTime > 0) {
        $totalPossiblePipes++;
        $pipeCounter++;
        
        // Aumentar el nivel y reducir la velocidad cada 10 pipes
        if ($pipeCounter % $levelIncrementPipes === 0) {
            $currentLevel++;
            $currentVelocity = max($minPipeVelocity, $currentVelocity - 100);
            
            // Reducir el tiempo de transición entre niveles
            $levelTransitionDelay = ($currentLevel === 1) ? 4500 : 3000;
            $remainingTime -= $levelTransitionDelay / 1000; // Convertir milisegundos a segundos
        }
        
        // Reducir el tiempo restante por la velocidad de aparición de los pipes
        $remainingTime -= $currentVelocity / 1000; // Convertir milisegundos a segundos
    }
    
    // La puntuación máxima posible se calcula como el total de pipes generados * un factor (1.1 como en JS)
    $maxPossibleScore = ceil($totalPossiblePipes * 1.1 / 100);
    
    // Validar si la puntuación del jugador es válida
    if ($score <= $maxPossibleScore) {
        return [
            "valid" => true,
            "message" => "Score is within possible range",
            "max_possible" => $maxPossibleScore
        ];
    } else {
        return [
            "valid" => false,
            "message" => "Score exceeds maximum possible value",
            "max_possible" => $maxPossibleScore
        ];
    }
}

// Obtener los datos enviados en el cuerpo de la solicitud
$data = json_decode(file_get_contents('php://input'), true);
$wallet_address = $data['address'];
$score = intval($data['highScore']);
$skin = $data['skin'];

// Dentro de DATA está el CSRF token, validar
if (!isset($data['csrf']) || $data['csrf'] !== $_SESSION['csrf']) {
    $response = array("success" => false, "error" => "Token CSRF invalido");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Verificar si el usuario ya existe en la tabla flappy_frog_highscores
$sql = "SELECT * FROM flappy_frog_highscores WHERE wallet_address = ?";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(1, $wallet_address);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    
    #if (!validateSolanaWallet($wallet_address)) {
    #    $response = array("success" => false, "error" => "Formato de wallet inválido, o no existe");
    #    header('Content-Type: application/json');
    #    echo json_encode($response);
    #    exit();
    #}

    // verificar timestamp de la última acción
    $lastAction = $result['last_action'];
    $lastActionTimestamp = strtotime($lastAction);
    $currentTimestamp = time();
    $timeDifference = $currentTimestamp - $lastActionTimestamp;
    if ($timeDifference < 6) {
        $response = array("success" => false, "error" => "Debes esperar 6 segundos entre cada acción");
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }

    if ($result['game_start_time'] == NULL) {
        $response = array("success" => false, "error" => "No has iniciado el juego!");
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    } 

    $currentTimestamp = date('Y-m-d H:i:s');       
    $scoreValidation = validateScore($lastAction, $score, time());

    if (!$scoreValidation["valid"]) {
        $response = array(
            "success" => false, 
            "error" => "Invalid score: " . $scoreValidation["message"],
            "max_possible" => $scoreValidation["max_possible"]
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }    

    // seguridad para evitar spam (meter accions como timestamp)
    $sql = "UPDATE flappy_frog_highscores SET last_action = NOW() WHERE wallet_address = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(1, $wallet_address);
    $stmt->execute();

    // verificar cuanto score hizo en base al tiempo en base al intervalo entre velas por segundo 

    // Si el usuario ya existe, actualizar su score en la tabla flappy_frog_highscores
    $sql = "UPDATE flappy_frog_highscores SET score = ?, skin = ?, game_start_time = NULL WHERE wallet_address = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(1, $score);
    $stmt->bindParam(2, $skin);
    $stmt->bindParam(3, $wallet_address);
} else {
    // debes registrar la wallet
    $response = array("success" => false, "error" => "Wallet no registrada");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Ejecutar la consulta y verificar el resultado
if ($stmt->execute()) {
    $response = array("success" => true);
} else {
    $response = array("success" => false, "error" => $stmt->errorInfo());
}

// Devolver la respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
?>