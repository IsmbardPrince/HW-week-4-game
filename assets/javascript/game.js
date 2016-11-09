//var totalGladiators = 5;
//var nameGladiators = ["Lorus", "Julis", "Maximus", "Brutus", "Cassius"]
//var initHealth = 100;
//var initAttack = 12;
//var initCounterattack = 8;

//var objGladiators = [];
//var ndxPlayerGladiator = -1;


// gameGladiator
// This is the object constructor for the Gladiator game written per the instructions
// for the week 4 homework. The game functions as spec'ed, however certain properties and
// variables may be unused or redundant as time constraints have made implementing some
// planned enhancements impossible. In particular, a function to create characters with 
// programmatically generated stats that implemented the rules for each character being able 
// to both win and lose was not implemented. The character stats used in this version of the
// game were generated experimentally. 
function gameGladiator(totalGladiators, nameGladiators) {
	
	// the following properties were intended to be accessible so they could be set to
	// allow modification of some game parameters from outside the game object;
	// they are mostly unused
	this.totalGladiators = 5;
	this.nameGladiators = ["Lorus", "Julius", "Maximus", "Brutus", "Cassius"];
	this.minHealth = 100;
	this.maxHealth = 250;
	this.minAttack = 8;
	this.maxAttack = 24;
	this.minCounterattack = 8;
	this.maxCounterattack = 24;

	// private variables used to keep track of the current game state
	var initSuccessful = false;
	var gameStarted = false;
	var playerSelected = false;
	var opponentSelected = false;
	var cntVictories = 0;
	var gameOver = false;

	// private variables for tracking the actual gladiator objects used to play the game
	var arrayGladiators = [];
	var ndxPlayer;
	var ndxOpponent;

	// utility to allow referencing object properties from inside the private functions
	var self = this;

	// gameGladiator.handleGameClick()
	// This method handles all of the clicks on the game objects, specifically clicks on any of
	// the gladiator representations. It is designed to be called by external event handlers which
	// actually receive the element clicks.
	this.handleGameClick = function() {

		// ignore any clicks on the gladiator objects if the game is over
		if (gameOver) return;

		// if a game has not been started, the first gladiator object click starts it
		if (!gameStarted) gameStarted = true;

		// if a player gladiator has not yet been selected, this click is considered the
		// selection click
		if (!playerSelected) {
			selectPlayer($(this)); // this procedure will select the clicked gladiator as the player
		} else {
			// if a player gladiator has already been selected, this procedure will select the 
			// player's opponent for the next fight unless one has already been selected, otherwise
			// the click will be ignored
			if (!opponentSelected) {
				selectOpponent($(this));
			}
			
		};

		// this rebinds the event handler to the gladiator object elements as it sometimes
		// becomes unbound as those elements are manipulated in the DOM
		$(".characterPic").on("click", self.handleGameClick);

	};

	// gameGladiator.handleAttackClick()
	// This method handles clicks for the attack button. All applicable values and html elements
	// are updated appropriately. It is designed to be called by external event handlers which
	// actually receive the element clicks.
	this.handleAttackClick = function() {

		// get the gladiator objects for the current match
		var player = arrayGladiators[ndxPlayer];
		var opponent = arrayGladiators[ndxOpponent];

		// play the battle sounds
		document.getElementById('battle').play();

		// compute the players current attack value per spec
		player.curAttack = player.baseAttack + (player.baseAttack  * player.numAttack++);
		// apply player's attack value to opponent's health
		opponent.curHealth -= player.curAttack;
		// if the attack took the opponent's remaining health, remove them from the game
		if (opponent.curHealth <= 0) {
			killedOpponent(ndxOpponent);
		} else {
			// if the opponent still has health apply their counterattack to the player's health
			player.curHealth -= opponent.counterattack;
			// if the opponent's attack took the player's remaining health, the game is over as a loss
			if (player.curHealth <= 0) {
				gameOverActions(false);
			} else {
				// if both player and opponent are still alive update the html elements appropriately
				var playerCharacter = $("#playerAttack").find(".characterPic");
				playerCharacter.find(".healthPlayer").html("Health: " + player.curHealth);
				playerCharacter.find(".attackPlayer").html("Attack: " + player.curAttack);
				var enemyCharacter = $("#enemyDefend").find(".characterPic");
				enemyCharacter.find(".healthPlayer").html("Health: " + opponent.curHealth);
			}
		}
	};

	// gladiator
	// This is the constructor for the gladiator object. It is a private object used by
	// the game to manage the information associated with each gladiator as the game
	// is played.
	function gladiator(name, health, attack, counterattack) {

		this.name = name; // name associated with the gladiator
		this.baseHealth = health; // gladiator's starting health
		this.curHealth = health; // gladiator's current health during game
		this.baseAttack = attack; // gladiator's base attack value
		this.curAttack = attack; // gladiator's current attack value during game
		this.numAttack = 0; // number of attacks gladiator has made; used to compute curAttack
		this.counterattack = counterattack; // gladiator's counterattack value

	};

	// init()
	// called when the object is constructed to ready the game for play
	function init() {

		// this creates the gladiator objects
		createGladiators(self.totalGladiators);

		// this modifies the DOM to display the information for the gladiators
		displayGladiators();

	};

	// createGladiators(count)
	// This function creates the gladiator objects and loads their initial data. It was originally
	// intended to generate this data programmatically, however this was not done due to time
	// constraints. The current data used for the objects was determined experimentally.
	function createGladiators(count) {

		var objCurrent;

		objCurrent = new gladiator(self.nameGladiators[0], 110, 10, 14);
		arrayGladiators.push(objCurrent);

		objCurrent = new gladiator(self.nameGladiators[1], 120, 7, 15);
		arrayGladiators.push(objCurrent);

		for (var i = 2; i < count -1; i++) {
			objCurrent = new gladiator(self.nameGladiators[i], 100 + (10 * i), 8 + (2 * i), 6 + (2 * i));
			arrayGladiators.push(objCurrent);
		}

		objCurrent = new gladiator(self.nameGladiators[4], 350, 4, 11);
		arrayGladiators.push(objCurrent);

	};

	// displayGladiators()
	// This function takes the data from the gladiator objects and modifies the DOM to create html
	// elements which represent the individual gladiators. At the beginning of the game all of the
	// gladiator elements are grouped together for the player to select their character from
	function displayGladiators() {

		var characterPic;

		// At the start of the game, all gladiator elements are grouped together in a table row
		$("#characterHome").append("<table id='characterPicTable'><tr id='characterPicRow'></tr></table>")
		// for each gladiator object, create and load a table cell to contain it's representation
		for (var i = 0; i < arrayGladiators.length; i++) {
			characterPic = $("<td class='characterPic'></td>");
			characterPic.attr("ndxGladiator", parseInt(i));
			characterPic.append("<img src='assets/images/gladiator" + parseInt(i) + ".jpg' class='imgGladiator'>");
			characterPic.append("<div class='nameGladiator' ndxGladiator= " + parseInt(i) + ">" + arrayGladiators[i].name + "</div>");
			characterPic.append("<div class='healthGladiator' ndxGladiator= " + parseInt(i) + ">Health: " + arrayGladiators[i].curHealth + "</div>");
			characterPic.append("<div class='attackGladiator' ndxGladiator= " + parseInt(i) + ">Attack:" + arrayGladiators[i].curAttack + "</div>");
			characterPic.append("<div class='defendGladiator' ndxGladiator= " + parseInt(i) + ">Counter:" + arrayGladiators[i].counterattack + "</div>");
			$("#characterPicRow").append(characterPic);
		}

	};

	// selectPlayer(playerCharacter)
	// When the player clicks on a gladiator element to select it for their character, this
	// procedure is called to save appropriate internal data and update the DOM to indicate the
	// player's selection
	function selectPlayer(playerCharacter) {

		// make sure the gladiator's representation can be properly positioned in the window
		playerCharacter.attr("position", "absolute");
		// remove the selected gladiator element from the other gladiator elements
		playerCharacter.remove();
		// move it to the player base area
		$("#playerBase").append(playerCharacter);

		// change the classes of all the player's gladiator display elements so that they can
		// be styled independently of the other gladiators
		playerCharacter.find(".imgGladiator").attr("class", "imgPlayer");
		playerCharacter.find(".nameGladiator").attr("class", "namePlayer");
		playerCharacter.find(".healthGladiator").attr("class", "healthPlayer");
		playerCharacter.find(".attackGladiator").attr("class", "attackPlayer");
		playerCharacter.find(".defendGladiator").attr("class", "defendPlayer");

		// move the unselected gladiator objects from the starting table to the enemy base
		var enemyCharacters = $("#characterPicTable").find(".characterPic");
		enemyCharacters.each(function() {
			$(this).remove();
			$("#enemyBase").append($(this));
		});

		// save the array index of the player gladiator object and change the game
		// state to indicate a player character has been selected
		ndxPlayer = playerCharacter.attr("ndxGladiator");
		playerSelected = true;

		displayMessage(createMessage(ndxPlayer, 0));

	};

	// selectOpponent(enemyCharacter)
	// When the player clicks on a gladiator element to select it as their opponent for a match,
	// this procedure is called to save appropriate internal data and update the DOM to indicate the
	// player's selection
	function selectOpponent(enemyCharacter) {

		// make sure the gladiator's representation can be properly positioned in the window
		enemyCharacter.attr("position", "absolute");
		// remove the selected gladiator element from the other enemy gladiator elements
		enemyCharacter.remove();
		// move it to the enemy's defense area
		$("#enemyDefend").append(enemyCharacter);

		// change the classes of all the enemy gladiator's display elements so that they can
		// be styled independently of the other gladiators
		enemyCharacter.find(".imgGladiator").attr("class", "imgPlayer");
		enemyCharacter.find(".nameGladiator").attr("class", "namePlayer");
		enemyCharacter.find(".healthGladiator").attr("class", "healthPlayer");
		enemyCharacter.find(".attackGladiator").attr("class", "attackPlayer");
		enemyCharacter.find(".defendGladiator").attr("class", "defendPlayer");

		// move the player character from their base to their attack position
		var playerCharacter = $("#playerBase").find(".characterPic");
		playerCharacter.remove();
		$("#playerAttack").append(playerCharacter);

		// save the array index of the enemy gladiator object and change the game
		// state to indicate a player character has been selected
		ndxOpponent = enemyCharacter.attr("ndxGladiator");
		opponentSelected = true;

		// make the attack button visible
		$("#btnAttack").css("visibility", "visible");

	};

	// killedOpponent(ndx)
	// This procedure is called when the player kills the opponent during a match. It removes that gladiator
	// from the game board and the game. If there are no remaining enemies, the game is over with a player
	// win. If there are additional enemies, the player character is moved back to the player base and the
	// the game waits for the next opponent to be selected.
	function killedOpponent(ndx) {

		// remove the defeated opponent from the game
		$("#enemyDefend").find(".characterPic").remove();
		opponentSelected = false;

		// check for game over
		if (++cntVictories == arrayGladiators.length - 1) {
			gameOverActions(true);
		} else {
			// otherwise move the player character back to base
			var playerCharacter = $("#playerAttack").find(".characterPic");
			playerCharacter.remove();
			$("#playerBase").append(playerCharacter);
			displayMessage(createMessage(ndxPlayer, cntVictories));
		};

		// make the attack button invisible
		$("#btnAttack").css("visibility", "hidden");

	};

	function gameOverActions(won) {

		if (won) {
			displayMessage(createMessage(ndxPlayer, 4));
		} else {
			displayMessage(createMessage(ndxPlayer, -1));
		}

	};

	function createMessage(ndxGladiator, ndxMessage) {

		var msg;

		switch (ndxMessage) {
			case -1:
				msg = "The emperor is disappointed in his champion. You have lost";
				break;
			case 0:
				msg = "Hail " + arrayGladiators[ndxGladiator].name + "! The emperor has chosen you as his champion today. Fight well and you will be rewarded.";
				break;
			case 1:
				msg = "The emperor is pleased with your victory and grants you freedom from your servitude.";
				break;
			case 2:
				msg = "You have fought well and the emperor has made you a citizen of Rome.";
				break;
			case 3:
				msg = "The emperor believes that your skill and bravery have earned you an appointment with one of his mighty legions.";
				break;
			case 4:
				msg = "You have performed great feats of strength, skill and daring in vanquishing all your foes. The emperor would like to honor your victory with an appointment to his personal guards.";
				break;
			default:
				msg = "This message is in error.";
		}
console.log(msg);
		return msg;
	}

	function displayMessage(message) {

		var btn = $("#btnMessage").detach();

console.log(message);
		$("#msgPane").html(message);
		$("#msgPane").append(btn);
		$("#msgPane").css("visibility", "visible");
	};

	// initialize the game when the game object is constructed
	initSuccessful = init(self);
	return initSuccessful;

}

$(document).ready(function (){

	// create the game object
	var game = new gameGladiator(5, ["Lorus", "Julis", "Maximus", "Brutus", "Cassius"]);

	// let the game handle the clicks on the game board
	$(".characterPic").on("click", game.handleGameClick);
	$("#btnAttack").on("click", game.handleAttackClick);
	$("#btnMessage").on("click", function() {
		$(this).parent().css("visibility", "hidden");
	});

});
