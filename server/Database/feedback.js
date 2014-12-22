module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertFeedbacksByCourse(courseID,texto,userid,tagNome,callback){
		connection.query("INSERT INTO Feedback(upvote,downvote,texto,data,CursoKey,CadeiraKey,UtilizadorKey) VALUES (0,0,'" + texto + "',CURRENT_TIMESTAMP(),'" + courseID + "'," + "NULL," + userid + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function insertFeedbacksByCadeira(cadeiraID,texto,userid,tagNome,callback){
		connection.query("INSERT INTO Feedback(upvote,downvote,texto,data,CadeiraKey,CursoKey,UtilizadorKey) VALUES (0,0,'" + texto + "',CURRENT_TIMESTAMP(),'" + cadeiraID + "'," + "NULL," + userid + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourse(courseID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CursoKey like '" + courseID + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourseLimit5(courseID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CursoKey like '" + courseID + "' ORDER BY difference desc LIMIT 5", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCadeira(cadeiraID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CadeiraKey like '" + cadeiraID + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCadeiraLimit5(cadeiraID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CadeiraKey like '" + cadeiraID + "' ORDER BY difference desc LIMIT 5", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function deleteFeedbackByCourse(cID,userid,callback) {
		connection.query("DELETE FROM Feedback WHERE CursoKey like '" + cID + "' and UtilizadorKey=" + userid, function(err, results)
		{
			callback(err,results);
		});
	}
	
	function deleteFeedbackByCadeira(cID,userid,callback) {
		connection.query("DELETE FROM Feedback WHERE CadeiraKey like '" + cID + "' and UtilizadorKey=" + userid, function(err, results)
		{
			callback(err,results);
		});
	}
	
	
	
	api.post('/:courseID', function(req, res) {
		var cID = req.params.courseID;
		var body = req.body, type = body.type, type2 = body.type2;
			if(type=="curso") 
			{
				if(type2=="insert")
				{
					if (auth.validTokenProvided(req, res)) {
						var texto = req.body.texto;
						var userid = req.body.userid;
						var tagnome = req.body.tagnome; 
						insertFeedbacksByCourse(cID,texto,userid,tagnome,function(err,result) {
							if(err)
							{
								console.log(err);
								res.send({
									success: false,
									results: err
								});
							}
							else {
								console.log(result);
								res.send({
									success: true,
									results: result
								});
							}
						});
					}
				}
				else if(type2=="get5")
				{
					getFeedbacksByCourseLimit5(cID,function(err,result) {
						if(err)
						{
							console.log(err);
							res.send({
								success: false,
								results: err
							});
						}
						else {
							console.log(result);
							res.send({
								success: true,
								results: result
							});
						}
					});
				}
				else if(type2=="delete")
				{
					if (auth.validTokenProvided(req, res)) {
						var userid = req.body.userid;
						deleteFeedbackByCourse(cID,userid,function(err,result) {
							if(err)
							{
								console.log(err);
								res.send({
									success: false,
									results: err
								});
							}
							else {
								console.log(result);
								res.send({
									success: true,
									results: result
								});
							}
						});
					}
				}
				else
				{
					getFeedbacksByCourse(cID,function(err,result) {
						if(err)
						{
							console.log(err);
							res.send({
								success: false,
								results: err
							});
						}
						else {
							console.log(result);
							res.send({
								success: true,
								results: result
							});
						}
					});
				}
			}
			else if (type=="cadeira")
			{
				if(type2=="insert")
				{
					if (auth.validTokenProvided(req, res)) {
						var texto = req.body.texto;
						var userid = req.body.userid;
						var tagnome = req.body.tagnome; 
						insertFeedbacksByCadeira(cID,texto,userid,tagnome,function(err,result) {
							if(err)
							{
								console.log(err);
								res.send({
									success: false,
									results: err
								});
							}
							else {
								console.log(result);
								res.send({
									success: true,
									results: result
								});
							}
						});
					}
				}
				else if(type2=="get5")
				{
					getFeedbacksByCadeiraLimit5(cID,function(err,result) {
						if(err)
						{
							console.log(err);
							res.send({
								success: false,
								results: err
							});
						}
						else {
							console.log(result);
							res.send({
								success: true,
								results: result
							});
						}
					});
				}
				else if(type2=="delete")
				{
					if (auth.validTokenProvided(req, res)) {
						var userid = req.body.userid;
						deleteFeedbackByCadeira(cID,userid,function(err,result) {
							if(err)
							{
								console.log(err);
								res.send({
									success: false,
									results: err
								});
							}
							else {
								console.log(result);
								res.send({
									success: true,
									results: result
								});
							}
						});
					}
				}
				else
				{
					getFeedbacksByCadeira(cID,function(err,result) {
						if(err)
						{
							console.log(err);
							res.send({
								success: false,
								results: err
							});
						}
						else {
							console.log(result);
							res.send({
								success: true,
								results: result
							});
						}
					});
				}
			}
});
   
    return {api: api, start: start};
}(module || {}));
