//Database stuff
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'feuphub',
  password : 'chituc2014',
  database : 'feuphubmain'
});

exports.getAll = function getCadeiras (callback) {
    var query = connection.query('SELECT * from Cadeira',function(err, results) {
		if (err) 
            callback(err,null);
        else
            callback(null,results);
	});
};

exports.getOne = function(req, res){
	var codigo = req.params.codigo;
	console.log(codigo);
	var queryString = "select * from Cadeira where codigo = '" + codigo + "'";
	console.log(queryString);
	connection.query(queryString, function(err, results)
	{
		console.log(err);
		res.send(results);
	});
}

