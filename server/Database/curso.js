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
		connection.query("select * from Curso where sigla = " + connection.escape(sigla) + "", function(err, results)
		{
			callback(err,results);
		});
	}
	
	function getStats(idCurso, callback){
		var resfinal = {};
		connection.query("SELECT * FROM (select count(*) as n_positivos from Feedback where avaliacao=true and CursoKey="+connection.escape(idCurso)+")db UNION ALL SELECT * FROM(select count(*)as cenas from Feedback where CursoKey="+connection.escape(idCurso)+")db2 ;", function(err2, results2)
		{
			resfinal.positivos = results2[0];
			resfinal.total = results2[1];
			callback(err2,resfinal);
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
	
	api.get('/stats/:sigla', function(req, res) {
        var sigla = req.params.sigla;
		getStats(sigla,function(err,results)
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
