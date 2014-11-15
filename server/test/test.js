var assert = require('assert');
var app = require('../../server.js');
var request = require('supertest')(app);

describe('Simple tests (always pass)', function (){
	describe('Array', function(){
	  describe('#indexOf()', function(){
		it('should return -1 when the value is not present', function(){
		  assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
		});
	  });
	});
});

describe('API',function () {
	describe('Database', function (){
		it('root answer with Hello', function(done) {
			request.get('/api/database/').expect('Hello database\n', done);
		});
	});
	describe('Sigarra', function (){
	
	});
});
