$(document).ready(function(){
    // le jeu
    var MG = MG || {};

    // périmètre d'initialisation
    MG.init = {
        urlGetScores : 'get_game_stats.php', // url de récupération des scores
        urlPostScore : 'add_game_stats.php', // url d'enregistrement du score de la partie
        matchedPairs : [], // tableau des cartes assemblées
        // tableau de structuration du jeu
        memoryArray : ['A','A','B','B','C','C','D','D','E','E','F','F','G','G','H','H','I','I','J','J','K','K','L','L','M','M','N','N','O','O','P','P','Q','Q','R','R'],
        // méthode de récupération des scores
        getBestScores : function() {
            $.get( this.urlGetScores, function( response ) {
                html = 'Aucune partie jouée pour le moment';
                if (response.length > 0) {
                    html = '<ul>';
                    $.each(response, function(idx, partie){
                        html += '<li>Partie '+partie[0]+' jouée en '+partie[1]+' secondes';
                    })
                    html += '<ul>';
                }
                $('#durations').append(html);
            });
        },
        // méthode de mélange du jeu
        shuffleDeck :function(array) {
            var j, x, i;
            for (i = array.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = array[i];
                array[i] = array[j];
                array[j] = x;
            }
            return array;
        },
        // méthode d'affichage des cartes
        displayDeck :function() {
            $.each(MG.init.memoryArray, function(idx, card) {
                var newCard = '<div class="memory-card card-'+idx+' showBack d-lg-inline-flex d-md-inline-flex d-sm-inline-flex" data-id-card="'+idx+'"></div>';
                $('#game-board').append(newCard);
            })
        },
        // méthode d'initialisation du jeu
        initApp : function() {
            MG.init.getBestScores(); // récupération des meilleurs scores
            MG.init.memoryArray = MG.init.shuffleDeck(MG.init.memoryArray); // mélange du jeu
            MG.init.displayDeck(); // affichage du jeu
            $('.memory-card').on('click', function(event) { // événement de sélection d'une carte
                // si le compte à rebours n'est pas lancé, on le lance
                if (MG.events.triggerCountdown == false) {
                    MG.events.countdown();
                }
                // si la carte n'appartient pas à une paire découverte, on la retourne et on teste la paire en cours
                if (!($(this).hasClass('showFront'))) {
                    MG.events.toggleShow(this);
                    MG.events.testMatch(this);
                }
            });
            // bouton «recommencer» la partie, on recharge la page
            $('button').on('click', function() {
                location.reload();
            });
        }
    }

    // périmètre des événements du jeu
    MG.events = {
        testedCard : '', // première carte de la paire en cours de test
        triggerCountdown : false, // permet de savoir si le compte à rebours est lancé
        gameDuration: 0, // durée du jeu
        gameDurationMax: 120, // durée maximale de durée du jeu (en secondes)
        nbPairs: 18, // nombre de paires dans le jeu
        setIntervalId : '', // id du compte à rebours
        // méthode de retournement des cartes
        toggleShow : function(card) {
            if ($(card).hasClass('showBack')) {
                $(card).removeClass('showBack');
                $(card).addClass('showFront');
                var idCard = ($(card).data('id-card'));

                // cette astuce permet de ne pas identifier les cartes en html ni css avec des classes,
                // le code ascii correspondant à la lettre de la carte permet d'afficher
                // les mêmes images pour les même cartes
                var typeCard = MG.init.memoryArray[idCard].charCodeAt();
                var position = (typeCard-65)*100;
                $(card).css({'background-image': "url('/assets/images/cards.png')", 'background-position-y' : position+'px'});
            } else {
                $(card).removeClass('showFront');
                $(card).addClass('showBack');
                $(card).css({'background-image': 'none', 'background-position-y' : '0px'});
            }
        },
        // méthode de test de similaté des cartes retournées
        testMatch : function(card) {
            // première carte retournée
            if (MG.events.testedCard.length == 0) {
                MG.events.testedCard = card;
            } else {  // deuxième carte retournée
                $('.overlay').css('display', 'block'); // l'overlay empêche de cliquer sur d'autre cartes que la paire en cours

                // si la carte sélectionnée précédemment fait la paire avec la carte en cours
                if (MG.init.memoryArray[$(MG.events.testedCard).data('id-card')] == MG.init.memoryArray[$(card).data('id-card')]) {
                    // on marque les cartes comme découvertes
                    MG.events.testedCard = ''; // on réinitialise à vide la première carte sélectionnée
                    $('.overlay').css('display', 'none'); // on permet à nouveau le clic sur le plateau de jeu
                    MG.init.matchedPairs.push($(card).data('id-card')); // on enregistre la paire découverte dans le tableau des paires découvertes

                    // si on a découvert toutes les paires
                    if (MG.init.matchedPairs.length == MG.events.nbPairs) {
                        clearInterval(MG.events.setIntervalId); // on arrête le compte à rebours
                        MG.events.gameFinished('won', MG.events.gameDuration/10); // on affiche de modal de partie gagnée
                        // on enregiste la durée en base
                        $.ajax({
                            url: MG.init.urlPostScore,
                            data: {
                                duration: MG.events.gameDuration/10
                            },
                            type: "POST",
                            dataType : "json",
                        });
                    }
                } else { // les 2 cartes ne font pas la paire, on temporise 1 seconde et on cache à nouveau les 2 cartes
                    setTimeout(
                        function() 
                        {
                            MG.events.toggleShow(card);
                            MG.events.toggleShow(MG.events.testedCard);
                            MG.events.testedCard = '';
                            $('.overlay').css('display', 'none');
                        }, 1000
                    );
                }
            }
        },
        // méthode de compte à rebours
        countdown() {
            MG.events.triggerCountdown = true; // on indique à l'appli qu'un compte à rebours est lancé
            var time = 0, max = MG.events.gameDurationMax*10,
            int = setInterval(function() {
                MG.events.setIntervalId = int;
                var width = 100 * time++ / max;
                MG.events.gameDuration = time;
                $('.progress-bar').css('width', width+'%').text(time/10+' s');
                // fin du compte à rebours, on l'arrête et on affiche le modal partie perdue
                if (time -1 == max) {
                    clearInterval(int);
                    MG.events.gameFinished('lost');
                }
            }, 100);
        },
        // méthode du modal de fin du jeu
        gameFinished(status, int) {
            var text = status == 'won' ? 'Vous avez gagné en '+int+' secondes !!!!!!' : 'Perdu !!!!!!';
            $('.modal-title').text(text);
            $('.modal').modal({backdrop: 'static', keyboard: false});
            $('.modal').modal('show');
        }
    };

    // lancement du jeu
    MG.init.initApp();
    
});