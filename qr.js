var qr = require('qr-image');
var url = require('url');
var fs = require('fs');
var proba = require('./probability');
var path = require('path');
var abilities = require('./client_app/abilities.json');
var gameState = require('./state.js');


var create = module.exports.create = function create(data) {
    qr_svg = qr.image(data, {type: 'png', size: 2 });
    var randomString = proba.randstring();
    var fileName = ''+randomString+'.png';
    var imagePath = path.resolve('./client_app/images/qr/'+fileName);
    var url = '/images/qr/'+fileName;
    qr_svg.pipe(fs.createWriteStream(imagePath));
    return url;
}

/**
 * compile an Array of QR code data which a player can use to interact with the gamestate
 * the data returned here ends up rendered as QR codes listed on the player's id card
 */
var compilePlayer = module.exports.compilePlayer = function compilePlayer(player) {
    if (typeof player === 'undfined')
        console.error('player is undefined. MAL code AB384');
        
    if (typeof player.abilities === 'undefined')
        return [];

    var scans = [];
    for (var i=0; i<player.abilities.length; i++) {

        // if the ability can be self-targeted, it will be added to the ID card.
        // first, ensure that the player ability we are inspecting is in the master abilities list
        if (typeof abilities[player.abilities[i].toLowerCase()] === 'undefined') {
            console.error('player ability %s you wanted is not in the master abilities list abilities[player.abilities[i] is undefined, so breaking!', player.abilities[i]);
            break;
        }
        
        var ability = abilities[player.abilities[i].toLowerCase()];
        if (typeof ability.endpoint === 'undefined') {
            console.error('ability %s must have an endpoint property, but got %s. Breaking!', ability, ability.endpoint);
            break;
        }

        var scan = {};
        var sourceid = player.id;
        var action = player.abilities[i].toLowerCase();
        var affiliation = player.affiliation;
        var cls = player['class'];

        scan.caption = player.abilities[i];
        
        if (action === 'register') {
            scan.data = url.resolve(gameState.url, '/'+ability.endpoint+
                                                   '?sourceid='+sourceid+
                                                   '&affiliation='+affiliation+
                                                   '&class='+cls
            );
        }

        else {
            scan.data = url.resolve(gameState.url, '/'+ability.endpoint+
                                                   '?sourceid='+sourceid
            );
        }
        
        scan.image = create(scan.data);
        scan.selfSource = abilities[player.abilities[i].toLowerCase()].selfSource;

        scans.push(scan);
    }

    
    return scans;
}



//module.exports.

/**

create QR code data for all classes
given this data...
                
    "captain":
    {
        "perTeam": 1,
        "priority": 2,
        "name": "Captain",
        "loadout": [
            "Assault Rifle",
            "Pistol",
            "Bandages"
        ],
        "abilities": [
            "Self-heal"
        ]
    },


        .. we should create a qr code for each ability
   qr.create('http://127.0.0.1:5000/interact?action=Self-heal&sourceid=xxxxxx')



*/




