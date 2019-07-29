<?php
// inclusion du manager de base de données
require_once 'db_manager.php';

// création d'une nouvelle instance de connexion
$dbManager = new DbManager();

// définition de la requête d'insertion
$dbManager->setQuery('INSERT INTO games (duration) VALUES (?)');

if (isset($_POST['duration']) && is_numeric($_POST['duration']) && $_POST['duration'] > 0 ) {
    // insertion de la durée dans la requête
    $dbManager->setDuration($_POST['duration']);

    // execution de la requête
    $dbManager->executeInsert();
}