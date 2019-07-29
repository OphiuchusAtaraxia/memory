# Création de la base de données du jeu
CREATE DATABASE memory;
CREATE TABLE memory.games (
	id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	duration DOUBLE NOT NULL,
    PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8
COLLATE=utf8_general_ci;
