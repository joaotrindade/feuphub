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
		var resfinal = {};
		connection.query("select * from Docente where codigo =(select docenteEscolhido from Feedback where CadeiraKey=" +connection.escape(idCadeira)+" GROUP BY docenteEscolhido order by count(docenteEscolhido) DESC LIMIT 1);", function(err, results)
		{
			if(results.length != 0)
			{
				resfinal.idDocente = results[0];
				console.log(results);
				connection.query("SELECT * FROM (select count(*) as n_positivos from Feedback where avaliacao=true and CadeiraKey="+connection.escape(idCadeira)+")db UNION ALL SELECT * FROM(select count(*)as cenas from Feedback where CadeiraKey="+connection.escape(idCadeira)+")db2 ;", function(err2, results2)
				{
					resfinal.positivos = results2[0];
					resfinal.total = results2[1];
					callback(err2,resfinal);
				});
			}
			else
			{
				connection.query("select nome,img_url from Docente inner join CadeiraDocente on Docente.codigo = CadeiraDocente.DocenteKey where CadeiraKey=" + connection.escape(idCadeira) + "LIMIT 1", function(err2,results2)
				{
					resfinal.idDocente = results2[0];
					console.log(results);
					connection.query("SELECT * FROM (select count(*) as n_positivos from Feedback where avaliacao=true and CadeiraKey="+connection.escape(idCadeira)+")db UNION ALL SELECT * FROM(select count(*)as cenas from Feedback where CadeiraKey="+connection.escape(idCadeira)+")db2 ;", function(err3, results3)
					{
						resfinal.positivos = results3[0];
						resfinal.total = results3[1];
						callback(err3,resfinal);
					});
				});
			}
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
			{
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
