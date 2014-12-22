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
		connection.query("select * from Cadeira inner join CadeiraCurso on Cadeira.codigo = CadeiraCurso.CadeiraKey where codigo = '" + codigo + "'", function(err, results)
		{
			callback(err,results);
		});
	}
	
	function getCadeirasMenu(idCurso,ano, callback){
		connection.query("select * from Cadeira inner join CadeiraCurso on Cadeira.codigo = CadeiraCurso.CadeiraKey where CursoKey = '" + idCurso + "' and ano=" + ano, function(err, results)
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
