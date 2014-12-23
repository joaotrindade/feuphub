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
		connection.query("select * from Cadeira inner join CadeiraCurso on Cadeira.codigo = CadeiraCurso.CadeiraKey where codigo = " + connection.escape(codigo) + "", function(err, results)
		{
			callback(err,results);
		});
	}
	
	function getCadeirasMenu(idCurso,ano, callback){
		connection.query("select * from Cadeira inner join CadeiraCurso on Cadeira.codigo = CadeiraCurso.CadeiraKey where CursoKey = " + connection.escape(idCurso) + " and ano=" + ano, function(err, results)
		{
			callback(err,results);
		});
	}
	
	function getDocentes(idCadeira, callback){
		connection.query("select * from Docente inner join CadeiraDocente on Docente.Codigo = CadeiraDocente.DocenteKey where CadeiraKey=" + connection.escape(idCadeira) + "", function(err, results)
		{
			callback(err,results);
		});
	}
	
	function getStats(idCadeira, callback){
		var resfinal = [];
		connection.query("select * from Docente where codigo =(select docenteEscolhido from Feedback where CadeiraKey=" +connection.escape(idCadeira)+" GROUP BY docenteEscolhido order by count(docenteEscolhido) LIMIT 1);", function(err, results)
		{
			console.log(err);
			resfinal.idDocente = results;
			console.log(results);
			connection.query("SELECT * FROM (select count(*) as n_positivos from Feedback where avaliacao=true and CadeiraKey="+connection.escape(idCadeira)+")db UNION ALL SELECT * FROM(select count(*)as cenas from Feedback where CadeiraKey="+connection.escape(idCadeira)+")db2 ;", function(err2, results2)
			{
				console.log("2");
				console.log(results2[0]);
				console.log(results2);
				resfinal.media = results2[0]/results2[1];
				callback(err2,resfinal);
			});
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
	
	api.post('/cadeiraMenu/', function(req, res) {
		var idCurso = req.body.idCurso;
		var ano = req.body.ano;
		getCadeirasMenu(idCurso,ano,function(err,results)
		{
			if(err)
			{
				res.send({
					success: false,
					results: err
				});
			}
			else
				res.send({
					success: true,
					results: results
				});
		});
    });
	
	api.post('/docentes/', function(req, res) {
		var idCadeira = req.body.idCadeira;
		getDocentes(idCadeira,function(err,results)
		{
			if(err)
			{
				res.send({
					success: false,
					results: err
				});
			}
			else
				res.send({
					success: true,
					results: results
				});
		});
    });
	
		api.get('/stats/:codigo', function(req, res) {
		var codigo = req.params.codigo;		
		getStats(codigo, function(err, results)
		{
			if(err)
			{	console.log("erro");
				console.log(err);
				res.send({
					success: false,
					results: err
				});
			}
			else
			{
				console.log(results);
				res.send({
					success: true,
					results: results
				});
			}				
		});
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
