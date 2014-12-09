module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getUser(numero,callback){
		connection.query("SELECT * FROM Visitante INNER JOIN Utilizador ON Visitante.id = Utilizador.VisitanteKey WHERE Utilizador.numero=" + numero, function(err, results)
		{
			callback(err,results);
		});
	};
	
	function updateNickname(idUser,nickname,callback) {
		connection.query("SELECT id FROM Visitante INNER JOIN Utilizador ON Visitante.id = Utilizador.VisitanteKey WHERE numero=" + idUser, function(err, results)
		{
			console.log(results[0].id);
			connection.query("UPDATE Visitante SET nickname='" + nickname + "' WHERE id=" + results[0].id, function(err, results2)
			{
				callback(err,results);
			});
		});
	};
	
	function updateEmail(idUser,email,callback) {
		connection.query("SELECT id FROM Visitante INNER JOIN Utilizador ON Visitante.id = Utilizador.VisitanteKey WHERE numero=" + idUser, function(err, results)
		{
			console.log(results[0].id);
			connection.query("UPDATE Visitante SET email='" + email + "' WHERE id=" + results[0].id, function(err, results2)
			{
				callback(err,results);
			});
		});
	}
	
	
	api.post('/', function(req, res) {
	var body = req.body, numero = body.numero;
	if (auth.validTokenProvided(req, res)) {
		getUser(numero,function(err,result) {
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

	api.post('/:idUser', function(req, res) {
	var numero = req.params.idUser;
	console.log("aqui");
	console.log(numero);
	var body = req.body, type=body.type, alterar=body.valor;
	if (auth.validTokenProvided(req, res)) {
		if(type=="nickname") {
			updateNickname(numero,alterar,function(err,result) {
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
		else if(type=="email")
		{
			updateEmail(numero,alterar,function(err,result) {
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
