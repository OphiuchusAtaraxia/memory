<?php
// inclusion du manager de base de données
require_once 'db_manager.php';

// création d'une nouvelle instance de connexion
$dbManager = new DbManager();

// définition de la requête de récupération des données
$dbManager->setQuery('SELECT * FROM games ORDER BY duration ASC LIMIT 0,3');

// sortie des données au format json
header('Content-type: application/json');
echo json_encode($dbManager->executeSelect());