var state = require('./state');
var fs = require('fs');
var radio = require('radio');


radio('save').subscribe(function save() {
    var randomString = Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);
    var epoch = (new Date).getTime();
    var fileName = './saves/'+epoch+'_'+randomString+'.json';
    fs.writeFile(fileName, JSON.stringify(state), { encoding: 'utf8' }, function(err, res) {
        if (err) console.error(err);
        console.log('saved game state as %s', fileName);
    });
});
