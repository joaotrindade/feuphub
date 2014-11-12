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
				res.send({
					success: false,
					results: err
				});
			else
				res.send({
					success: true,
					results: results
				});
		});
    });
	
	api.post('/', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
			getAll(function(err,results)
			{
				if(err)
					res.send({
						success: false,
						results: err
					});
				else
					res.send({
						success: true,
						results: results
					});
			});
		}
		else{
			res.send("not allowed");
		}
    });
	

	api.get('/:codigo', function(req, res) {
		var codigo = req.params.codigo;		
		getOne(codigo, function(err, results)
		{
			if(err)
				res.send({
					success: false,
					results: err
				});
			else
				res.send({
					success: true,
					results: results
				});		
		});
    });
	
    return {api: api, start: start};
}(module || {}));
