module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertTopico(courseID,tipo,titulo,texto,data,userid,callback){
		connection.query("INSERT INTO Topico(tipo,titulo,upvote,downvote,texto,data,CursoKey,UtilizadorKey) VALUES (" + tipo + ",'" + titulo + "',0,0,'" + texto + "',CURRENT_TIMESTAMP(),'" + courseID + "'," + userid + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function deleteTopic(tID,callback){
		connection.query("SELECT RespostaKey FROM Utilizador_Resposta INNER JOIN Resposta on Utilizador_Resposta.RespostaKey=Resposta.id WHERE TopicoKey=" + tID, function(err, resultssel)
		{
			for(var x=0;x<resultssel.length;x++)
			{
				connection.query("DELETE FROM Utilizador_Resposta WHERE RespostaKey=" + resultssel[x].RespostaKey, function(err, results)
				{
					
				});
			}
			connection.query("DELETE FROM Resposta WHERE TopicoKey=" + tID, function(err, results)
			{
				connection.query("DELETE FROM Utilizador_Topico WHERE TopicoKey=" + tID, function(err, results)
				{
					connection.query("DELETE FROM Topico WHERE id=" + tID, function(err, results)
					{
						callback(err,results);
					});
				});
			});
		});
	};
	
	
	
	function getTopicos(courseID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.CursoKey like '" + courseID + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicosbyUser(userID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.UtilizadorKey = " + userID + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicosbyUserResposta(userID,callback){
		connection.query("SELECT distinct(Topico.id),Topico.tipo,Topico.titulo,Topico.upvote-Topico.downvote as difference,Topico.texto,DATE_FORMAT(Topico.data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero INNER JOIN Resposta on Topico.id = Resposta.TopicoKey inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Resposta.UtilizadorKey = " + userID + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicoByID(tID,callback){
		connection.query("SELECT Topico.id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nickname as nome,numero FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE Topico.id = " + tID + " ORDER BY data asc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function upvoteTopico(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Topico WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Topico WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results2)
				{
					if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Topico SET upvote=upvote-1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=0 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Topico SET downvote=downvote-1,upvote=upvote+1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=1,downvote=0 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Topico SET upvote=upvote+1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET upvote=1 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
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
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + uID + "," + tID + ",0,1)", function(err, results)
				{
					connection.query("UPDATE Topico SET upvote=upvote+1 WHERE id = " + tID + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	
	function downvoteTopico(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Topico WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Topico WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results2)
				{
					if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Topico SET downvote=downvote-1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=0 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Topico SET upvote=upvote-1,downvote=downvote+1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=1,upvote=0 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Topico SET downvote=downvote+1 WHERE id = " + tID + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Topico SET downvote=1 WHERE UtilizadorKey = " + uID + " AND TopicoKey = " + tID + "", function(err, results3)
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
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + uID + "," + tID + ",1,0)", function(err, results)
				{
					connection.query("UPDATE Topico SET downvote=downvote+1 WHERE id = " + tID + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	
	api.post('/:courseID', function(req, res) {
		console.log("aqui");
		var cID = req.params.courseID;
		console.log(cID);
		var body = req.body, type = body.type;
		console.log(type);
		if(type=="insert") {
			if (auth.validTokenProvided(req, res)) {
				var tipo  = body.tipo;
				var titulo = body.titulo;
				var texto = body.texto;
				var data = body.data;
				var userid = body.userid;
				insertTopico(cID,tipo,titulo,texto,data,userid,function(err,result) {
					if(err)
					{
						console.log(err);
						res.send({
							success: false,
						});
					}
					else {
						console.log(result);
						res.send({
							success: true,
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
		else if(type=="userrespostas")
		{
			if (auth.validTokenProvided(req, res)) {
				getTopicosbyUserResposta(cID,function(err,result) {
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
		else {
			getTopicos(cID,function(err,result) {
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
});

	api.post('/id/:topicID', function(req, res) {
		var tID = req.params.topicID;
		var body = req.body, type = body.type;
		console.log(type);
		if(type=="delete") 
		{
			if (auth.validTokenProvided(req, res)) {
				deleteTopic(tID,function(err,result) {
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
			getTopicoByID(tID,function(err,result) {
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
			  else if(type=="down") {
					downvoteTopico(uID,tID,function(err,result) {
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
