module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function insertTopico(courseID,tipo,titulo,texto,data,callback){
		connection.query("INSERT INTO Topico(tipo,titulo,upvote,downvote,texto,data,CursoKey) VALUES (" + tipo + ",'" + titulo + "',0,0,'" + texto + "',CURRENT_TIMESTAMP(),'" + courseID + "')", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicos(courseID,callback){
		connection.query("SELECT id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nome FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero WHERE Topico.CursoKey like '" + courseID + "' ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getTopicoByID(tID,callback){
		connection.query("SELECT id,Topico.tipo,titulo,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,Topico.CursoKey,nome FROM Topico inner join Utilizador on Topico.UtilizadorKey = Utilizador.numero WHERE Topico.id = " + tID + " ORDER BY difference desc", function(err, results)
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
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + uID + "," + tID + ",1,0)", function(err, results)
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
				connection.query("INSERT INTO Utilizador_Topico VALUES(" + uID + "," + tID + ",0,1)", function(err, results)
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
		var cID = req.params.courseID;
		var body = req.body, type = body.type;
		if(type=="insert") {
			var tipo  = body.tipo;
			var titulo = body.titulo;
			var texto = body.texto;
			var data = body.data;
			insertTopico(cID,tipo,titulo,texto,data,function(err,result) {
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
