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
var cheerio = require('cheerio');			//Dom manipulation
var Q = require('q');						//promises
var qhttp = require('q-io/http');			//http promises
var util = require('util');					//redirect console log to file
var curso = require('./database/curso');
var cadeira = require('./database/cadeira');

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

var urlStudentAcademicPath = "https://sigarra.up.pt/feup/pt/fest_geral.curso_percurso_academico_view";

var studentAcademicPath = {
	url: 'https://sigarra.up.pt/feup/pt/fest_geral.curso_percurso_academico_view',
    method: 'GET',
    headers: headers,
}

var urlStudentCourses = "https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login";

var studentCourses = {
	url: 'https://sigarra.up.pt/feup/pt/mob_fest_geral.ucurr_aprovadas_login',
    method: 'GET',
    headers: headers,
}

var urlAllCourses = "http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio";

var allCourses = {
	url: 'http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio',
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

// DATABASE ROUTES -----------------------------------

// Curso
app.get('/database/curso',curso.getAll);
app.get('/database/curso/:sigla',curso.getOne);

// Cadeira
app.get('/database/cadeira', cadeira.getAll);
app.get('/database/cadeira/:codigo', cadeira.getOne);



// ---------------------------------------------------

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

router.get('/api/studentAcademicPath',function(req,res){
	studentAcademicPath.url += "?pv_fest_id=" + req.query.pv_fest_id;
	headers["Cookie"] = req.headers.cookie;
	
	// Start the request
	request(studentAcademicPath, function(error, response, body){
	if (!error && response.statusCode == 200) {
			res.send(response);
		}
		else{
			res.send(response);
		}
		studentAcademicPath.url = urlStudentAcademicPath;
		resetCookies();
	})
});

router.get('/api/getStudentCourses',function(req,res){

	studentCourses.url += "?pv_login=" + req.query.pv_login;
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

router.get('/api/getAllCourses',function(req,res){

	getCourses().then(function(results){res.send(results);}).done();
	
});

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

// START HTTPS SERVER
https.createServer(options, app).listen(port);
// =============================================================================
console.log('Magic happens on port ' + port+"\n");

//Auxiliar functions
function resetCookies(){
	http_session="";
	si_session="";
	si_security="";
	headers["Cookie"] = "";
	return;
}

function getCourses(){
	var deferred = Q.defer();
	// Start the request
	request(allCourses, function(error, response, body){
	if (!error && response.statusCode == 200) {

		    $ = cheerio.load(response.body);
			var urls = [];
			$('#MI_a li').map(function(i, link) {
				var href = $(link).find('a:first-child').attr('href');
				var url = 'http://sigarra.up.pt/feup/pt/'+href;
				urls.push(url);
			});
			
			var coursePromises = urls.map(getCourse);

			Q.all(coursePromises).then(function(courses){
				deferred.resolve(courses);
			});
		}
		else{
			deferred.reject();
		}
		allCourses.url = urlAllCourses;
	})
    return deferred.promise;
}

function getCourse(url){
	var deferred = Q.defer();

	request({
		url: url,
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if(error){
			console.log("getCourse failed");
			deferred.reject();
		}
		else if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var course = new Curso($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			var urlCourseUnits = 'http://sigarra.up.pt/feup/pt/' + $('.curso-informacoes div:nth-child(4) li a')[0].attribs.href;
			getCourseUnits(urlCourseUnits).then(getCourseUnitTeachers).then(function(){deferred.resolve(course);}).done();	
		}});
	
    return deferred.promise;
}

function getCourseUnits(urlCourseUnits){
	var deferred = Q.defer();
		
	request({
		url: urlCourseUnits,
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if(error){
			console.log("getCourseUnits failed");
			deferred.reject();
		}else if (response.statusCode == 200) {
			$ = cheerio.load(body);
			
			//most generic case
			var curso = $('#conteudoinner > h1:nth-child(3)')[0].children[0].data;
			var year = $('div[id*="ano_"]:not([id*="div_percursos"]) > table');			
			
			var log_file = fs.createWriteStream('debug.log', {flags : 'w'});
			var log_stdout = process.stdout;
		
			console.log = function(d) { //
			  log_file.write(util.format(d));
			  log_stdout.write(util.format(d));
			  return;
			};
						
			console.log(curso+"\n");
			var parseYearPromises = [0,1,2,3,4].map(function(a) {return parseYear(body,a);});
			/*
			for(i=0; i<year.length;i++)
			{
				parseYearPromises.push(parseYear(body,i));
			}*/
			
			Q.all(parseYearPromises).then(function(){
				deferred.resolve(3);
			});

			console.log("\n");
			deferred.resolve(3);
		}});
		
    return deferred.promise;
}

function getCourseUnitTeachers(courseUnit){
	var deferred = Q.defer();
	//console.log(courseUnit);
	deferred.resolve(2);
    return deferred.promise;
}

function parseCourses(array)
{
	var ar = new Array();
	var arrayLength = array.length;
	for (var i = 0; i < arrayLength; i++) {
    request({
		url: array[i],
		method: 'GET',
		headers: headers,
	},function(error,response,body){
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			ar.push({ url: url, Course: new Course($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data)});
			//array[i]['Course'] = 1;// new Course($('#conteudoinner').children()[2].children[0].data,$('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			return;
		}});
	}
	console.log(ar);
	return;
}

function Curso(nome, sigla)
{
	this.nome = nome;
	this.sigla = sigla;
	this.plano = new Array();
}

function Semestre(ano, semestre, tronco)
{
	this.nome = nome;
	this.semestre = semestre;
	this.tronco = tronco;
}

function Tronco(tipo)
{
	this.tipo = tipo;
	this.cadeiras = new Array();
}

function Cadeira(nome, sigla, codigo, optativa)
{
	this.nome = nome;
	this.sigla = sigla;
	this.codigo = codigo;
	this.optativa = optativa;
	this.profs = new Array();
}

function Professor(nome,codigo)
{
	this.nome = nome;
	this.codigo = codigo;
}

function parseYear(html, year) //parses html for year
{
	console.log("parsing ano: "+(year+1)+"\n");
	var deferred = Q.defer();
	$ = cheerio.load(html);
	
	var yearData = $('div[id*="ano_"]:not([id*="div_percursos"]) > table ')[year];
	var aux = yearData.find('tr');
	console.log(aux);
	console.log("\t");
	var informationDivs = new Array();
	try{
		console.log(yearData.name+": ");
		console.log(yearData.attribs);
		console.log(" child len: "+yearData.children.length);
		console.log("\n");
		for(i=0; i<yearData.children.length;i++){ //remove wierd children
			if(yearData.children[i].type == 'tag'){
				//console.log("\t\t");
				//console.log(yearData.children[i].name);
				//console.log(" "+yearData.children[i].type);
				informationDivs.push(yearData.children[i]);
				//console.log("\n");
			}
		}
		var att;
		informationDivs.forEach(function(entry)
		{
			console.log("\t\t"+entry.name);
			att = entry.find("table").attribs;
			console.log(att);
			console.log("\n");
		});
		
		
	}catch(err){
		console.log("here: "+err);
		//console.log(yearData);
	}
	
	console.log("\n");		
	deferred.resolve(3);

	return deferred.promise;
}
