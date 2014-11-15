var request = require('supertest');
var app = require('server.js');
 
describe('GET /', function() {
  it('respond withHello database', function(done) {
    request(app).get('/api/database/').expect('Hello database', done);
  });
});

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
    })
  })
})