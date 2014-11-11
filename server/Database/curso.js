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
		connection.query("select * from Curso where sigla = '" + sigla + "'", function(err, results)
		{
			callback(err,results);
		});
	}
	
    api.get('/', function(req, res) {
        getAll(function(err,results)
		{
			if(err)
				res.send(err);
			else
				res.send(results);
		});
    });
	
	api.post('/', function(req, res) {
		if (auth.validTokenProvided(req, res)) {
			getAll(function(err,results)
			{
				if(err)
					res.send(err);
				else
					res.send(results);
			});
		}
		else
			res.send("not allowed");
    });

	api.get('/:sigla', function(req, res) {
        var sigla = req.params.sigla;
		getAll(sigla,function(err,results)
		{
			if(err)
				res.send(err);
			else
				res.send(results);
		});
    });
	
    return {api: api, start: start};
}(module || {}));
