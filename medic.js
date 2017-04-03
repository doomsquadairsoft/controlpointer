// Medic subsystem

// when the game starts, the first phone to visit the medic page gets a special auth cookie.
// that auth cookie signifies that the phone is a medic.
// subsequent requests to heal players will only succeed if the auth cookie exists.


var _ = require('lodash');
var randmember = require('./probability').randmember;
var gameState = require('./state');




var triage = function triage() {
    var triageOutcomes = [
        { message: 'Player %s healed!', chance: 90 },
        { message: 'MORPHINE HIGH! Player %s is immune to the next 2 BB hits! While invulnerable, instead of calling hit, call "morphine!" (not immune to explosives.)', chance: 1 },
        { message: 'DISABLED LIMB. Player %s must choose a limb to not use until they are shot by an enemy.', chance: 4 },
        { message: 'DAMAGED GUN. Player %s is healed, but their gun is inoperable. (Repair your gun by high-fiving two non-medic teammates.)', chance: 5 }
    ];
    return randmember(triageOutcomes);
}


var healPlayer = function healPlayer(player) {
    console.log('healing player');
    console.log(player);

    var affiliation = player.affiliation;
    var firstName = player.firstName;
    var lastName = player.lastName;;

    // exit if affiliation could not be determined, or was something other than red or blu
    if (typeof affiliation === 'undefined' || (affiliation !== 'red' && affiliation !== 'blu')) return 0

    // increment this player's heal count
    if (typeof player.healCount === 'undefined') player.healCount = 1;
    else player.healCount += 1;

    // deduct death ticket
    gameState.deathTickets[affiliation] -= 1;

    return firstName+' '+lastName;
}






module.exports.api = function api(app, become) {
    app.get('/medic/heal', become.authorize, function(req, res) {
        
        if (typeof req.query.targetid === 'undefined') {
            res.send('Heal? Heal WHO? Did you scan the QR code or are you A HAXXOR!?');
        }
        else {
            var targetid = req.query.targetid;
            var playerData = gameState.players.red.concat(gameState.players.blu);
            var player = _.find(playerData, ['id', targetid]);
            if (typeof player === 'undefined') {
                res.send('You cannot heal a player that is not in the game!');
            }
            else {
                var result = healPlayer(player, gameState);
                // @todo random perks or detriments such as morphine high or broken arm
                var outcome = triage(targetid);
                res.send(outcome);
            }
        }
    });
}
