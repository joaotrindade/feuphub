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
   
    return {api: api, start: start};
}(module || {}));
