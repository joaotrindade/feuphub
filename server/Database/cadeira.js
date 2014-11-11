module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getAll(callback){
		connection.query("select * from Cadeira", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getOne(codigo, callback){
		connection.query("select * from Cadeira where codigo = '" + sigla + "'", function(err, results)
		{
			callback(err,results);
		});
	}

    api.get('/', function(req, res) {
        getAll(function(err, results)
		{
			if(err)
				res.send(err);
			else
				res.send(results);
		});
    });

	api.get('/:codigo', function(req, res) {
		var codigo = req.params.codigo;		
		getOne(codigo, function(err, results)
		{
			if(err)
				res.send(err);
			else
				res.send(results);		
		});
    });
	
    return {api: api, start: start};
}(module || {}));
