module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertFeedbacksByCourse(courseID,texto,userid,tagNome,callback){
		connection.query("INSERT INTO Feedback(upvote,downvote,texto,data,CursoKey,CadeiraKey,UtilizadorKey) VALUES (0,0," + connection.escape(texto) + ",CURRENT_TIMESTAMP(),'" + connection.escape(courseID) + "'," + "NULL," + connection.escape(userid) + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function insertFeedbacksByCadeira(cadeiraID,texto,userid,tagNome,codDocente,avaliacao,callback){
		connection.query("INSERT INTO Feedback(upvote,downvote,texto,data,CadeiraKey,CursoKey,UtilizadorKey,docenteEscolhido,avaliacao) VALUES (0,0," + connection.escape(texto) + ",CURRENT_TIMESTAMP()," + connection.escape(cadeiraID) + "," + "NULL," + connection.escape(userid) + "," + connection.escape(codDocente) + "," + connection.escape(avaliacao) + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourse(courseID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CursoKey like " + connection.escape(courseID) + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCourseLimit5(courseID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CursoKey like " + connection.escape(courseID) + " ORDER BY difference desc LIMIT 5", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCadeira(cadeiraID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CadeiraKey like " + connection.escape(cadeiraID) + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getFeedbacksByCadeiraLimit5(cadeiraID,callback){
		connection.query("SELECT Feedback.id,texto,upvote-downvote as difference,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Feedback.CursoKey,nickname as nome FROM Feedback inner join Utilizador on Feedback.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Feedback.CadeiraKey like " + connection.escape(cadeiraID) + " ORDER BY difference desc LIMIT 5", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function deleteFeedback(fID,userid,callback) {
		connection.query("DELETE FROM Feedback WHERE id = " + connection.escape(fID) + " and UtilizadorKey = " + connection.escape(userid), function(err, results)
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
			else if(type=="delete")
			{
				if (auth.validTokenProvided(req, res)) {
						var fID = req.body.idFeedback;
						var userid = req.body.NumeroUser;
						deleteFeedback(fID,userid,function(err,result) {
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
						var codDocente = req.body.codDocente;
						var avaliacao = req.body.avaliacao;
						insertFeedbacksByCadeira(cID,texto,userid,tagnome,codDocente,avaliacao,function(err,result) {
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
