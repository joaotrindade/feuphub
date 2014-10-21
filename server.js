// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var https = require('https');
var http = require('http');
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');			//for proxy http requests
var fs = require('fs');						//ssl certificates
var path = require('path');

var options = {
  key: fs.readFileSync('opt/certs/feuphub_fe_up_pt.key'),
  cert: fs.readFileSync('opt/certs/cert-437-feuphub.fe.up.pt.pem')
};

var http_session='';
var si_session='';
var si_security='';

// Set request headers
var headers = {
    'User-Agent':       'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
    'Content-Type':     'text/plain;charset=UTF-16',
	'Cookie' : ''
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

var urlStudentPvNumUnico = "https://sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina";

var studentPvNumUnico = {
    url: 'https://sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina',
    method: 'GET',
    headers: headers,
} 

var urlStudentPage = "https://sigarra.up.pt/feup/pt/fest_geral.cursos_list";

var studentPage = {
	url: 'https://sigarra.up.pt/feup/pt/fest_geral.cursos_list',
    method: 'GET',
    headers: headers,
}

var urlStudentCourses = "https://sigarra.up.pt/feup/pt/fest_geral.curso_percurso_academico_view";

var studentCourses = {
	url: 'https://sigarra.up.pt/feup/pt/fest_geral.curso_percurso_academico_view',
    method: 'GET',
    headers: headers,
}

var urlCourses = "https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login";

var courses = {
	url: 'https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login',
    method: 'GET',
    headers: headers,
}


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Remember: The order of the middleware matters!
// Everything in public will be accessible from '/'
app.use(express.static(path.join(__dirname, 'application')));

var port = process.env.PORT || 443; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// REGISTER OUR ROUTES -------------------------------
router.get('/',function(req,res){
	res.sendfile(__dirname + 'index.html');
});

router.post('/api/login', function(req, res) {
	
	loginCredentials.form.p_user = req.body.username;
	loginCredentials.form.p_pass = req.body.password;
	
	// Start the request	
	request(loginCredentials, function (error, response) {
		if (!error && response.statusCode == 200 && response.headers["set-cookie"].length>0) {				
			si_session = response.headers["set-cookie"][0];
			si_security = response.headers["set-cookie"][1];
			headers["Cookie"] = "";
			headers["Cookie"] = http_session+" "+si_session+" "+si_security;
			res.send(response);
		}else{
			res.send(response);
		}
		resetCookies();
	})
});

router.post('/api/logout',function(req,res){
	headers["Cookie"] = req.headers.cookie;
	// Start the request	
	request(logoutCredentials, function (error, response) {
		res.send(response);
	})
	resetCookies();
});

router.get('/api/initialWebPage', function(req, res) {
	headers["Cookie"] = req.headers.cookie;
	
	// Start the request
	request(initialWebPage, function (error, response, body) {
		if (!error && response.statusCode == 200 && response.headers["set-cookie"][0]!== undefined) {
			http_session = response.headers["set-cookie"][0];
			headers["Cookie"] = "";
			headers["Cookie"] = http_session+" "+si_session+" "+si_security;
			res.send(response);
		}
		else{
			res.send(response);
		}
		resetCookies();
	})
});

router.get('/api/getPvNumUnico', function(req, res) {
	studentPvNumUnico.url += "?pct_id=" + req.query.pct_id;
	headers["Cookie"] = req.headers.cookie;
	// Start the request	
	request(studentPvNumUnico, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
		studentPvNumUnico.url = urlStudentPvNumUnico;
		resetCookies();
	})
});

router.get('/api/getStudentPage',function(req,res){
	studentPage.url += "?pv_num_unico=" + req.query.pv_num_unico;
	headers["Cookie"] = req.headers.cookie;
	
	// Start the request
	request(studentPage, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
		studentPage.url = urlStudentPage;
		resetCookies();
	})
});

router.get('/api/studentCourses',function(req,res){
	studentCourses.url += "?pv_fest_id=" + req.query.pv_fest_id;
	headers["Cookie"] = req.headers.cookie;
	
	// Start the request
	request(studentCourses, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
		studentCourses.url = urlStudentCourses;
		resetCookies();
	})
});

router.get('/api/getCourses',function(req,res){

	courses.url += "?pv_login=" + req.query.pv_login;
	headers["Cookie"] = req.headers.cookie;
	
	// Start the request
	request(courses, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
		courses.url = urlCourses;
		resetCookies();
	})

})

router.get('/api/certifiedLogin',function(req,res){

	request({
		url: 'https://sigarra.up.pt/feup/pt/vld_validacao.federate_login?p_redirect=http://localhost:901/',
		method: 'GET',
		headers: headers,
		},function(error,response,body){
			res.send(response);
	})
});

// all of our routes will be prefixed with
app.use('', router);

// Create a http and https server for our app
var httpServer = http.createServer(function(req, res){
	res.writeHead(301, {
		"location" : "https://localhost"
	});
	
	res.end();

}).listen(80);

// START HTTPS SERVER
https.createServer(options, app).listen(port);
// =============================================================================
console.log('Magic happens on port ' + port);

//Auxiliar functions
function resetCookies(){
	http_session="";
	si_session="";
	si_security="";
	headers["Cookie"] = "";
	return;
}
