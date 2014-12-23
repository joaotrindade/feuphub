module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function addOne(idn,texton,datan,user_id,callback){
		connection.query("INSERT INTO Resposta(upvote,downvote,texto,data,UtilizadorKey,TopicoKey) VALUES(0,0,'" + connection.escape(texton) + "',CURRENT_TIMESTAMP()," + connection.escape(user_id) + "," + connection.escape(idn) + ")", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getRespostas(tID,callback){
		connection.query("SELECT Resposta.id,upvote-downvote as difference,texto,DATE_FORMAT(data,'%h:%i %p %M %e, %Y') as data,nickname as nome FROM Resposta inner join Utilizador on Resposta.UtilizadorKey = Utilizador.numero inner join Visitante on Utilizador.VisitanteKey = Visitante.id WHERE TopicoKey = " + connection.escape(tID) + " ORDER BY difference desc", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function upvoteResposta(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Resposta WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Resposta WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results2)
				{
					if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Resposta SET upvote=upvote-1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET upvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Resposta SET downvote=downvote-1,upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET upvote=1,downvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Resposta SET upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET upvote=1 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
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
				connection.query("INSERT INTO Utilizador_Resposta VALUES(" + connection.escape(uID) + "," + connection.escape(tID) + ",0,1)", function(err, results)
				{
					connection.query("UPDATE Resposta SET upvote=upvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	 
	function downvoteResposta(uID,tID,callback) {
		connection.query("SELECT COUNT(UtilizadorKey) as nr FROM Utilizador_Resposta WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results1)
		{
			if(results1[0].nr == 1)
			{
				connection.query("SELECT upvote,downvote FROM Utilizador_Resposta WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results2)
				{
					if(results2[0].downvote == 1)
					{
						connection.query("UPDATE Resposta SET downvote=downvote-1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET downvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "retirou";
								callback(err,results);
							});
						});
					}
					else if(results2[0].upvote == 1)
					{
						connection.query("UPDATE Resposta SET upvote=upvote-1,downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET downvote=1,upvote=0 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
							{
								results['tipo'] = "trocou";
								callback(err,results);
							});
						});
					}
					else
					{
						connection.query("UPDATE Resposta SET downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
						{
							connection.query("UPDATE Utilizador_Resposta SET downvote=1 WHERE UtilizadorKey = " + connection.escape(uID) + " AND RespostaKey = " + connection.escape(tID) + "", function(err, results3)
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
				connection.query("INSERT INTO Utilizador_Resposta VALUES(" + connection.escape(uID) + "," + connection.escape(tID) + ",1,0)", function(err, results)
				{
					connection.query("UPDATE Resposta SET downvote=downvote+1 WHERE id = " + connection.escape(tID) + "", function(err, results)
					{
						results['tipo'] = "inseriu";
						callback(err,results);
					});
				});
			}
		});
	}
	
	api.post('/', function(req, res) {
	if (auth.validTokenProvided(req, res)) {
		var id = req.body.id_questao;
		var texto = req.body.texto;
		var data = req.body.data;
		var user_id = req.body.userid;
		addOne(id,texto,data,user_id,function(err,result) {
			if(err)
			{
				res.send({
					success: false
				});
			}
			else {
				res.send({
					success: true
				});
			}
		});
	}
});

api.post('/:topicID', function(req, res) {
		var tID = req.params.topicID;
		getRespostas(tID,function(err,result) {
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
});

api.post('/:typeID/:answerID', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
			var body = req.body,
			  uID = body.idUser,
			  type = req.params.typeID,
			  rID = req.params.answerID;
			  if(type=="up") {
					upvoteResposta(uID,rID,function(err,result) {
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
					downvoteResposta(uID,rID,function(err,result) {
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
