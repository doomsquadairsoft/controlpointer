var assert = require('chai').assert;
var fixtures = require('../fixtures');
var R = require('ramda');


describe('fixtures', function() {
  describe('fixtures.timeline', function() {
    it('should export an array of timeline events', function() {
      assert.isArray(fixtures.timeline);
      const validate = (tli) => {
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');
      }
      R.forEach(validate, fixtures.timeline);
    });
  });
});
