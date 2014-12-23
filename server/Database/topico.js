module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertTopico(courseID,tipo,titulo,texto,data,userid,callback){
		connection.query("INSERT INTO Topico(tipo,titulo,upvote,downvote,texto,data,CursoKey,UtilizadorKey) VALUES (" + tipo + ",'" + connection.escape(titulo) + "',0,0,'" + connection.escape(texto) + "',CURRENT_TIMESTAMP(),'" + connection.escape(courseID) + "'," + userid + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function insertTopicoCadeira(cadeiraID,tipo,titulo,texto,data,userid,callback){
		connection.query("INSERT INTO Topico(tipo,titulo,upvote,downvote,texto,data,CadeiraKey,UtilizadorKey) VALUES (" + connection.escape(tipo) + ",'" + connection.escape(titulo) + "',0,0,'" + connection.escape(texto) + "',CURRENT_TIMESTAMP(),'" + connection.escape(cadeiraID) + "'," + connection.escape(userid) + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function deleteTopic(tID,callback){
		connection.query("SELECT RespostaKey FROM Utilizador_Resposta INNER JOIN Resposta on Utilizador_Resposta.RespostaKey=Resposta.id WHERE TopicoKey=" + connection.escape(tID), function(err, resultssel)
		{
			for(var x=0;x<resultssel.length;x++)
			{
				connection.query("DELETE FROM Utilizador_Resposta WHERE RespostaKey=" + connection.escape(resultssel[x].RespostaKey), function(err, results)
				{
					
				});
			}
			connection.query("DELETE FROM Resposta WHERE TopicoKey=" + connection.escape(tID), function(err, results)
			{
				connection.query("DELETE FROM Utilizador_Topico WHERE TopicoKey=" + connection.escape(tID), function(err, results)
				{
					connection.query("DELETE FROM Topico WHERE id=" + connection.escape(tID), function(err, results)
					{
						callback(err,results);
					});
				});
			});
		});
	};
	
	
	
	function getTopicos(courseID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,Topico.CadeiraKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.CursoKey like '" + connection.escape(courseID) + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicosbyUser(userID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,Topico.CadeiraKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.UtilizadorKey = " + connection.escape(userID) + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicosbyCadeira(cadeiraId,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,Topico.CadeiraKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.CadeiraKey = '" + connection.escape(cadeiraId) + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicosbyUserResposta(userID,callback){
		connection.query("SELECT distinct(Topico.id),Topico.tipo,Topico.titulo,Topico.upvote-Topico.downvote as difference,Topico.texto,DATE_FORMAT(Topico.data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey, Topico.CadeiraKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero INNER JOIN Resposta on Topico.id = Resposta.TopicoKey inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Resposta.UtilizadorKey = " + connection.escape(userID) + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicoByID(tID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey, Topico.CadeiraKey, nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.id = " + connection.escape(tID) + " ORDER BY data asc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function upvoteTopico(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Topico WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Topico WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results2)
				{
					if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Topico SET upvote=upvote-1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Topico SET downvote=downvote-1,upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=1,downvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Topico SET upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=1 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "inseriu";
								callback(err,results);
							});
						});
					}
				});
			}
			else
			{
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + connection.escape(uID) + "," + connection.escape(tID) + ",0,1)", function(err, results)
				{
					connection.query("UPDATE Topico SET upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	
	function downvoteTopico(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Topico WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Topico WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results2)
				{
					if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Topico SET downvote=downvote-1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Topico SET upvote=upvote-1,downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=1,upvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Topico SET downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=1 WHERE UtilizadorKey = " + connection.escape(uID) + " AND TopicoKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "inseriu";
								callback(err,results);
							});
						});
					}
				});
			}
			else
			{
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + connection.escape(uID) + "," + connection.escape(tID) + ",1,0)", function(err, results)
				{
					connection.query("UPDATE Topico SET downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	
	api.post('/:courseID', function(req, res) {
		var cID = req.params.courseID;
		var body = req.body, type = body.type;
		if(type=="insert") { // INSERT CURSO
			if (auth.validTokenProvided(req, res)) {
				var tipo  = body.tipo;
				var titulo = body.titulo;
				var texto = body.texto;
				var data = body.data;
				var userid = body.userid;
				insertTopico(cID,tipo,titulo,texto,data,userid,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
						});
					}
					else {
						res.send({
							success: true,
							id: result.insertId
						});
					}
				});
			}
		}
		else if (type=='insertCadeira')
		{
			if (auth.validTokenProvided(req, res)) {
				var tipo  = body.tipo;
				var titulo = body.titulo;
				var texto = body.texto;
				var data = body.data;
				var userid = body.userid;
				
				insertTopicoCadeira(cID,tipo,titulo,texto,data,userid,function(err,result) {
					if(err)
						{
							res.send({
								success: false,
							});
						}
						else {
							res.send({
								success: true,
								id: result.insertId
							});
						}
				});
			}
		}
		else if(type=="user")
		{
			if (auth.validTokenProvided(req, res)) {
				getTopicosbyUser(cID,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
							results: err
						});
					}
					else {
						res.send({
							success: true,
							results: result
						});
					}
				});
			}
		}
		else if(type=="userrespostas")
		{
			if (auth.validTokenProvided(req, res)) {
				getTopicosbyUserResposta(cID,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
							results: err
						});
					}
					else {
						res.send({
							success: true,
							results: result
						});
					}
				});
			}
		}
		else if(type=="getTopicosCadeira")
		{
			if (auth.validTokenProvided(req, res)) {
				getTopicosbyCadeira(cID,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
							results: err
						});
					}
					else {
						res.send({
							success: true,
							results: result
						});
					}
				});
			}
		}
		else {
			getTopicos(cID,function(err,result) {
				if(err)
				{
					res.send({
						success: false,
						results: err
					});
				}
				else {
					res.send({
						success: true,
						results: result
					});
				}
			});
		}
});

	api.post('/id/:topicID', function(req, res) {
		var tID = req.params.topicID;
		var body = req.body, type = body.type;
		if(type=="delete") 
		{
			if (auth.validTokenProvided(req, res)) {
				deleteTopic(tID,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
							results: err
						});
					}
					else {
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
			getTopicoByID(tID,function(err,result) {
				if(err)
				{
					res.send({
						success: false,
						results: err
					});
				}
				else {
					res.send({
						success: true,
						results: result
					});
				}
			});
		}
});

	api.post('/:typeID/:topicID', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
			var body = req.body,
			  uID = body.idUser,
			  type = req.params.typeID,
			  tID = req.params.topicID;
			  if(type=="up") {
					upvoteTopico(uID,tID,function(err,result) {
						if(err)
						{
							res.send({
								success: false,
								results: err
							});
						}
						else {
							res.send({
								success: true,
								results: result
							});
						}
					});
			  }
			  else if(type=="down") {
					downvoteTopico(uID,tID,function(err,result) {
					if(err)
					{
						res.send({
							success: false,
							results: err
						});
					}
					else {
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
