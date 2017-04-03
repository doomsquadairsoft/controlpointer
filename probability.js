var _ = require('lodash');


// greets http://stackoverflow.com/a/3983830/1004931
module.exports.randmember = function randmember(items) {

    var probas = _.map(items, 'chance');
    var ar = [];
    var i = 0;
    var sum = 0;

    for (i=0; i<probas.length-1; i++) {
        sum += (probas[i] / 100.0);
        ar[i] = sum;
    }
    
    var r = Math.random();
    for (i=0; i<ar.length && r>=ar[i]; i++);
    return items[i];
}

module.exports.randstring = function randstring() {
    return Math.random().toString(24).replace(/[^a-z]+/g, '').substr(0, 12);
}
