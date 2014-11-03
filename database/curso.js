//Database stuff
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '',
  database : 'feuphubmain'
});

exports.getAll = function(req, res){
	connection.query("select * from curso", function(err, results)
	{
		res.send(results);
	});
}

exports.getOne = function(req, res){
	var sigla = req.params.sigla;
	console.log(sigla);
	var queryString = "select * from curso where sigla = '" + sigla + "'";
	console.log(queryString);
	connection.query(queryString, function(err, results)
	{
		console.log(err);
		res.send(results);
	});
}

