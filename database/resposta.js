//Database stuff
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '',
  database : 'feuphubmain'
});

exports.insertOne = function(idn,texton,datan,user_id,callback){
	var query = connection.query("INSERT INTO resposta2(id,texto,data,userid) VALUES(" + idn + ",'" + texton + "','" + datan + "','" + user_id + "')",function(err, results) {
		if (err) 
            callback(err,null);
        else
            callback(null,results);
	});
}

