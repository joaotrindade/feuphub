module.exports = (function() {
    'use strict';
	var mysql      = require('mysql');
	var connection = mysql.createConnection({
		host     : '127.0.0.1',
		user     : 'feuphub',
		password : 'chituc2014',
		database : 'feuphubmain'
	});
	
	var api = express.Router();
	var course = require("./curso");
	course.start(connection);
	var cadeira = require("./cadeira");
	cadeira.start(connection);
	var resposta = require("./resposta");
	resposta.start(connection);
	var topico = require("./topico");
	topico.start(connection);
	var feedback = require("./feedback");
	feedback.start(connection);
	var search = require("./search");
	search.start(connection);
	var utilizador = require("./utilizador");
	utilizador.start(connection);
	
	api.get('/', function(req, res) {
        res.send("Hello, this is the database!\n")
    });
	
	api.use('/curso', course.api);
	api.use('/cadeira', cadeira.api);
	api.use('/resposta',resposta.api);
	api.use('/topico',topico.api);
	api.use('/feedback',feedback.api);
	api.use('/search',search.api);
	api.use('/utilizador',utilizador.api);
    return api;

	
}(module || {}));