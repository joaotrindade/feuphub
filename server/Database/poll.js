module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getPollByCreatedUser(userId, callback){
		connection.query("SELECT * FROM `Poll` WHERE `UtilizadorKey` = "+connection.escape(userId), function(err, results)
		{
			callback(err,results);
		});
	};
	function getPollById(id, callback){
		connection.query("SELECT * FROM `Poll` WHERE `id` = "+connection.escape(id), function(err, results)
		{
			callback(err,results);
		});
	};
	function getPollByCurso(cursoId, callback){
		connection.query("SELECT * FROM `Poll` WHERE `CursoKey` = "+connection.escape(cursoId), function(err, results)
		{
			callback(err,results);
		});
	};
	function getPollByCadeira(cadeiraId, callback){
		connection.query("SELECT * FROM `Poll` WHERE `CadeiraKey` = "+connection.escape(cadeiraId), function(err, results)
		{
			callback(err,results);
		});
	};
	function deletePoll(pollId, userId,callback){
		getPollById(pollId, function (err,results){
			if(err){
				callback("Poll not found",[]);
			}else if(results[0]['UtilizadorKey']!= userId){
				callback("User of id " + userId + " is not the creator of the poll",[]);
			}else{
				connection.query("DELETE FROM `Poll` WHERE `id` = " +connection.escape(pollId)+ " and `UtilizadorKey` = 1", function(err, results)
				{
					callback(err,results);
				});
			}
		});
	};
	function createPoll(poll, callback){}; //poll must contain->creatorId(User), title, pergunta, cadeiraKey OR cursoKey, poll options
	function voteInPoll(pollId, utilizadorId, pollResponse, callback){};
	function removeVoteInPoll(pollId, utilizadorId, pollResponse, callback){};
	
	api.post('/id/:id', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var pollID = req.params.id;
			getPollById(pollID, function(err, results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	api.post('/user', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
			var userID = req.body.id;
			getPollByCreatedUser(userID, function(err, results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	api.get('/course/:courseID',function(req,res){
		var courseID = req.params.courseID;
		getPollByCurso(courseID, function(err, results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
	});
	api.post('/cadeira/:cadeiraID', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var cadeiraID = req.params.cadeiraID;
			getPollByCadeira(cadeiraID, function(err, results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
    api.post('/delete/:id', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var pollID = req.params.id;
			var userID = req.body.userid;
			deletePoll(pollID, userID, function(err,results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	api.post('/create', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var poll = req.body.poll;
			createPoll(poll, function(err,results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	api.post('/vote/:id', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var pollID = req.params.id;
			var userID = req.body.userID;
			var pollChoiceID = req.body.pollResponseID;
			voteInPoll(pollID, userID, pollChoiceID, function(err,results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	api.post('/unvote/:id', function(req,res){
		if (auth.validTokenProvided(req, res)) {
			var pollID = req.params.id;
			var userID = req.body.userID;
			var pollChoiceID = req.body.pollResponseID;
			removeVoteInPoll(pollID, userID, pollChoiceID, function(err,results){
				if(err){
					res.send({
						success: false,
						results: err
					});
				}else {
					res.send({
						success: true,
						results: results
					});
				}
			});
		}
	});
	
	return {api: api, start: start};
}(module || {}));

//get poll by created user
//get poll by curso
//get poll by cadeira
//get poll by id??
//update poll, receives id
//delete poll, by id
//create poll by user, must receive either curso or cadeira, never both
//vote, id of poll, id utilizador, id of pollResponse
//unvote