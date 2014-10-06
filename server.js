// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');			//for proxy http requests

var http_session='';
var si_session='';
var si_security='';

// Set request headers
var headers = {
    'User-Agent':       'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
    'Content-Type':     'text/plain;charset=UTF-16',
	'set-cookie' : http_session+si_session+si_security
}

// Configure the checklogin request
var loginCredentials = {
    url: 'https://sigarra.up.pt/feup/pt/vld_validacao.validacao',
    method: 'POST',
    headers: headers,
    form: {'p_app': '162', 'p_amo': '1665', 'p_user': '', 'p_pass': ''}
}

var logoutCredentials = {
    url: 'https://sigarra.up.pt/feup/pt/vld_validacao.sair',
    method: 'POST',
    headers: headers,
    form: {'p_address': 'WEB_PAGE.INICIAL'}
}

var initialWebPage = {
    url: 'https://sigarra.up.pt/feup/pt/WEB_PAGE.INICIAL',
    method: 'GET',
    headers: headers
}

var studentPvNumUnico = {
    url: 'https://sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina',
    method: 'GET',
    headers: headers,
    form: {'pct_id': ''}
} 

var studentPage = {
	url: 'https://sigarra.up.pt/feup/pt/fest_geral.cursos_list',
    method: 'GET',
    headers: headers,
    form: {'pv_num_unico': ''}
}

var studentCourses = {
	url: 'https://sigarra.up.pt/feup/pt/fest_geral.curso_percurso_academico_view',
    method: 'GET',
    headers: headers,
    form: {'pv_fest_id': ''}
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/application/css", express.static(__dirname + '/application/css'));
app.use("/application/js", express.static(__dirname + '/application/js'));

var port = process.env.PORT || 901; 		// set our port

app.set(function() {
    app.use(express.static(__dirname + '/public'));
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:901/api)
router.get('/',function(req,res){
  res.sendfile(__dirname + '/application/index.html');
});

router.post('/api/login', function(req, res) {
	
	loginCredentials.form.p_user = req.body.username;
	loginCredentials.form.p_pass = req.body.password;
	
	// Start the request	
	request(loginCredentials, function (error, response) {
		if (!error && response.statusCode == 200 && response.headers["set-cookie"][1]!== undefined) {				
			si_session = response.headers["set-cookie"][0];
			si_security = response.headers["set-cookie"][1];
			
			headers["set-cookie"] = "";
			headers["set-cookie"] = http_session+si_session+si_security;
			console.log(response.headers["set-cookie"]);
			console.log(headers["set-cookie"]);
			res.send(response);
			
		}else{
			res.send(response);
		}
	})
});

router.post('/api/logout',function(req,res){
	// Start the request	
	request(logoutCredentials, function (error, response) {
		if (!error && response.statusCode == 200) {				
			console.log(headers["set-cookie"]);
			http_session="";
			si_session = "";
			si_security = "";
			headers["set-cookie"] = "";
			headers["set-cookie"] = http_session+si_session+si_security;
			console.log("cleared server\n");
			res.send(response);			
		}else{
			res.send(response);
		}
	})
});

router.get('/api/initialWebPage', function(req, res) {
	request(initialWebPage, function (error, response, body) {
		if (!error && response.statusCode == 200 && response.headers["set-cookie"][0]!== undefined) {
			http_session = response.headers["set-cookie"][0];
			headers["set-cookie"] = "";
			headers["set-cookie"] = http_session+si_session+si_security;
			res.send(response);
		}
		else{
			res.send(response);
		}
	})
});

router.get('/api/getPvNumUnico', function(req, res) {	
	studentPvNumUnico.form.pct_id = req.body.userId;
	// Start the request	
	request(studentPvNumUnico, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
	})
});

router.get('/api/getStudentPage',function(req,res){
	studentPage.form.pv_num_unico = req.body.studentNum;
	// Start the request
	request(studentPage, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
	})
});

router.get('/api/studentCourses',function(req,res){
	studentCourses.form.pv_fest_id = req.body.pv_fest_id;
	// Start the request
	request(studentCourses, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
	})
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with
app.use('', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);