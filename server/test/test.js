var assert = require('assert');
var app = require('../../server.js');
var request = require('supertest')(app);
var requests = require('request');			//for proxy http requests
var TopicId=0;
var token;

/*A simple test, purely to test if mocha and supertest framework are working*/
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
		
		/* Tests if server urls are responding correctly to unit test http requests*/
		it('root answers with Hello', function(done) {
			request.get('/api/database/').expect('Hello, this is the database!\n', done);
		});
		
		/*Tests if for a given user (assumes user & pass values are valid) a token is given*/
		it('authenticate user', function (done){
			var data = {'username': '201109244', 'password': 'pass' , 'loginSuccess' : 'able'};
			request.post("/api/auth/authenticate")
			.send(data)
			.expect(function(done){
				assert.equal(true, res.body.success);
				token = res.body.success.token;
			}).end(done);
		});

		/*Tests if an authenticated user can create a topic*/
		it('create topic', function (done){
			var data = { 'token' : token, 'type': 'insert' , 'tipo': 1, 'titulo': 'unitTest', 'texto': 'a little bit of test', 'userid': 201109244};				
			request.post("/api/database/topico/MIEIC")
			.send(data)
			.expect(function (res) {
				assert.equal(true, res.body.id!=0);
				TopicId=res.body.id;
				assert.equal(true, res.body.success);
			})
			.end(done);
		});
		
		/*Tests if an authenticated user can vote in a created topic*/
		it('upvote topic', function (done){
			var data = {'token':token, 'idUser':201109244};
			var diff=0;
			request.post("/api/database/topico/up/"+TopicId).send(data).expect(function(res){
				assert.equal(1,res.body.results.affectedRows);
				assert.equal(1,res.body.success);
			}).end(done);
		});
		
		/*Tests if the user who created a topic may delete it*/
		it('get topic information', function (done){
			request.post("/api/database/topico/id/"+TopicId).expect(function(res){
				diff = res.body.results[0].difference;
				assert.equal(1,diff);
			}).end(done);
		});
		
		it('delete topic', function (done){
			request.post("/api/database/topico/id/"+TopicId).send({'token':token, 'idUser':201109244, 'type': 'delete'}).expect(function(res){
				assert.equal(true, res.body.success);
			}).end(done);
		});
	});
});


