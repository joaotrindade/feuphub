module.exports = (function() {
    'use strict';
    var api = express.Router();
	var connection;
	
	function start(conn){
		connection = conn;
	};
	
	function getAll(callback){
		connection.query("select * from Curso", function(err, results)
		{
			callback(err,results);
		});
	};
	
	function getOne(sigla, callback){
		connection.query("select * from Curso where sigla = '" + connection.escape(sigla) + "'", function(err, results)
		{
			callback(err,results);
		});
	}
	
    api.get('/', function(req, res) {
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
		else
			res.send("not allowed");
    });

	api.get('/:sigla', function(req, res) {
        var sigla = req.params.sigla;
		getOne(sigla,function(err,results)
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
