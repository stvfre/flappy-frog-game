<?php

include 'db_config.php';

$sql = "SELECT wallet_address, score, skin FROM flappy_frog_highscores ORDER BY score DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$highScores = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($highScores);

?>