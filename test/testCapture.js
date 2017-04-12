
var assert = require('chai').assert;
var capture = require('../capture.js');
var fixtures = require('../fixtures/index');

describe('determineNextPlayerState', function() {
    describe('red team', function() {
	it('should return cre for unk', function() {
	    capture.determineNextPlayerState('unk', fixtures.player)
		.then(function(state) {
		    assert.isString('cre');
		});
	});
	
    })
})
