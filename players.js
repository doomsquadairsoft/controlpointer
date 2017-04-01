#!/Users/lol/.nvm/versions/node/v4.5.0/bin/node


// players subsystem


// Creates an Identity for each player in the game
// writes it to players.json


var commandLineArgs = require('command-line-args');
const objectDefinitions = [
    { name: 'blu', alias: 'b', type: Number },
    { name: 'red', alias: 'r', type: Number }
];
const options = commandLineArgs(objectDefinitions);



if (typeof options.blu === 'undefined' || typeof options.red === 'undefined') {
    console.log('USAGE: ./players.js --blu 5 --red 6');
    process.exit();
}


console.log('%s BLU players, %s RED players', options.blu, options.red);


//var hb = require('handlebars');


var classes = require('./client_app/classes.json');
var faker = require('faker');
var _ = require('lodash');
var fs = require('fs');


// validate class data
for (var c in classes) {
    if (classes.hasOwnProperty(c)) {
        if (typeof classes[c].perTeam === 'undefined') throw new Error('each class must have a perTeam property');
        if (typeof classes[c].priority === 'undefined') throw new Error('each class must have a priority property');
        if (typeof classes[c].abilities === 'undefined') throw new Error('each class must have a abilities property');
        if (typeof classes[c].loadout === 'undefined') throw new Error('each class must have a loadout property');
    }
}

// validate player data @todo
//        if (typeof classes[c].dob === 'undefined') throw new Error('each class must have a dob property');
//        if (typeof classes[c].id === 'undefined') throw new Error('each class must have a id property');
//        if (typeof classes[c].firstName === 'undefined') throw new Error('each class must have a firstName property');
//        if (typeof classes[c].lastName === 'undefined') throw new Error('each class must have a lastName property');
//        if (typeof classes[c]['class'] === 'undefined') throw new Error('each class must have a class property');


function getClasses(teamCount, classes) {

    // find out what classes we have to work with.
    // sort them by priority.
    var classes = _.sortBy(classes, ['priority']);
    var output = [];
    var createdPlayerCount = 0;
    
    for (var c in classes) {
        if (createdPlayerCount < teamCount) {
            var thisClass = classes[c];
            
            // give the team this classtype, up to the maximum allowed classtype per team
            // there is one special exception, if perTeam is -1, continue forever* until the team is populated.
            if (thisClass.perTeam === -1) {
                thisClass.perTeam = 1000000; // * 1 Million players is close enough to "forever"
            }
            for (i=0; i < thisClass.perTeam; i++) {
                if (createdPlayerCount < teamCount) {
                    // create a new player if this team is not populated yet
                    console.log('adding %s to output. i=%s, thisClass.perTeam=%s, createdPlayerCount=%s, teamCount=%s',
                                thisClass.name,
                                i,
                                thisClass.perTeam,
                                createdPlayerCount,
                                teamCount
                               );
                    output.push(thisClass);
                    createdPlayerCount += 1;
                }
                else {
                    break;
                }
            }
        }
        else {
            break;
        }
    }
    
    return output;
}


function getPlayers(teamCount, classes) {

    // for each player, assign them a random class
    classes = _.shuffle(classes);
    var players = [];
    for (i=0; i < teamCount; i++) {
        var player = {};
        player.id = faker.random.alphaNumeric(12);
        player.firstName = faker.name.firstName();
        player.lastName = faker.name.lastName();
        player.dob = faker.date.between(new Date('1 Jan 1970'), new Date('25 Dec 1995'));
        player['class'] = classes[i].name;
        player.loadout = classes[i].loadout;
        player.abilities = classes[i].abilities;
        player.tagline = classes[i].tagline;
        players.push(player);
    }
    
    return players;
    
    // generate player list like this--
    // {
    //   shu7zojjm67t: {
    //     id: 'shu7zojjm67t',
    //     firstName: Mariam,
    //     lastName: Gusikowski,
    //     dob: '10/31/1980',
    //     class: 'Grenadier',
    //     loadout: [
    //       'Assault Rifle',
    //       'Pistol',
    //       'High-output smoke grenade',
    //       'Frag grenade'
    //     ],
    //     abilities: [
    //        ...
    //     ]
    //   }
    // }
}




var redClasses = getClasses(options.red, classes);
var bluClasses = getClasses(options.blu, classes);


var redPlayers = getPlayers(options.red, redClasses);
var bluPlayers = getPlayers(options.blu, bluClasses);


// write player data to disk as JSON
var data = {};
data['red'] = redPlayers;
data['blu'] = bluPlayers;

fs.writeFileSync('./client_app/players.json', JSON.stringify(data), { 'encoding': 'utf8' });









