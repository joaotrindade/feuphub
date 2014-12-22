var assert = require('assert');
var app = require('../../server.js');
var request = require('supertest')(app);
var requests = require('request');			//for proxy http requests
Q = require('q');						//promises

var mysql      = require('mysql');
var connectionTest = mysql.createConnection({
	host     : 'feuphub.fe.up.pt',
	user     : 'feuphub',
	password : 'chituc2014',
	database : 'feuphubtests'
});
//token da39a3ee5e6b4b0d3255bfef95

database.connection = connectionTest;

var TopicId=0;
//utilizador 201109244
//crias um topico, das upvote, um select ao numero de upvotes desse topico tem que dar 1

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
		
		it('root answers with Hello', function(done) {
			request.get('/api/database/').expect('Hello, this is the database!\n', done);
		});
		
		it('authenticate user', function (done){
			var data = {'username': '201109244', 'password': 'pass' , 'loginSuccess' : 'able'};
			request.post("/api/auth/authenticate")
			.send(data)
			.expect({
				success: true,
				token: 'da39a3ee5e6b4b0d3255bfef95'
			}, done);
		});
		
		it('create topic', function (done){
			var data = { token : 'da39a3ee5e6b4b0d3255bfef95', type: 'insert' , tipo: 1, titulo: 'unitTest', texto: 'a little bit of test', userid: 201109244};				
			request.post("/api/database/topico/MIEIC")
			.send(data)
			.expect(function (res) {
				assert.equal(true, res.body.id!=0);
				TopicId=res.body.id;
				assert.equal(true, res.body.success);
			})
			.end(done);
		});
		
		it('upvote topic', function (done){
			var data = {"token":'da39a3ee5e6b4b0d3255bfef95', "idUser":201109244};
			var diff=0;
			request.post("/api/database/topico/up/"+TopicId).send(data).expect(function(res){
				assert.equal(1,res.body.results.affectedRows);
				assert.equal(1,res.body.success);
			}).end(done);
		});
		
		it('get topic information', function (done){
			request.post("/api/database/topico/id/"+TopicId).expect(function(res){
				diff = res.body.results[0].difference;
				assert.equal(1,diff);
			}).end(done);
		});
		
		it('delete topic', function (done){
			request.post("/api/database/topico/id/"+TopicId).send({"token":'da39a3ee5e6b4b0d3255bfef95', "idUser":201109244, type: 'delete'}).expect(function(res){
				assert.equal(true, res.body.success);
			}).end(done);
		});
	});
});


