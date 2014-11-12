module.exports = (function() {
    'use strict';
	
	var api = express.Router();

	api.get('/', function(req, res) {
        getCourses().then(function(results){res.send(results);}).done();
    });
	
    return api;

	
}(module || {}));
/*
fs.unlink('debug.log');
var log_file = fs.createWriteStream('debug.log', {flags : 'w'});
var log_stdout = process.stdout;
		
console.log = function(d) { //
	log_file.write(util.format(d));
	//log_stdout.write(util.format(d));
	return;
};*/

var urlAllCourses = "http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio";

var allCourses = {
	url: 'http://sigarra.up.pt/feup/pt/cur_geral.cur_inicio',
    method: 'GET'
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
		encoding:null
	},function(error,response,body){
		if(error){
			console.log("getCourse failed");
			deferred.reject();
		}
		else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			var course = new Curso($('#conteudoinner').children()[2].children[0].data, $('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			var coursePlanUrl = 'http://sigarra.up.pt/feup/pt/' + $('.curso-informacoes div:nth-child(4) li a')[0].attribs.href;
			parseCoursePlan(coursePlanUrl).then(function(data){deferred.resolve(course);}).done();	
		}});
	
    return deferred.promise;
}


function parseCoursePlan(coursePlanUrl){
	var deferred = Q.defer();
		
	request({
		url: coursePlanUrl,
		method: 'GET',
		encoding: null
	},function(error,response,body){
		if(error){
			console.log("parseCoursePlan failed");
			deferred.reject();
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			
			var curso = $('#conteudoinner > h1:nth-child(3)')[0].children[0].data;		
			console.log(curso+"\n");	
			
			var courseUnitsHref = [];
			$('a[href*="ucurr_geral.ficha_uc_view"]').each(function(i, elem) {
				courseUnitsHref[i] = 'http://sigarra.up.pt/feup/pt/' + $(this)[0].attribs["href"];
			});
			
			var uniqueCourseUnits = courseUnitsHref.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			})
			
			console.log("têm "+uniqueCourseUnits.length + " cadeiras");
			
			var courseUnitPromises = uniqueCourseUnits.map(function(a) {return parseCourseUnit(a);});
			
			Q.all(courseUnitPromises).then(function(data){
				deferred.resolve(3);
			});
			console.log("\n\n");
		}});
		
    return deferred.promise;
}

function parseCourseUnit(courseUnitUrl)
{
	var deferred = Q.defer();
	
	request({
		url: courseUnitUrl,
		method: 'GET',
		encoding: null,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("parseCourseUnit failed");
			deferred.reject();
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			//console.log("\n\n");
			//console.log($('body'));
			//console.log("\n");
			if($('body').children().length ==0){
				//console.log("redirect to "+$('a')[0].attribs["href"]+"\n");
				parseCourseUnit($('a')[0].attribs["href"]).then(function(promise){deferred.resolve(promise);})
			}else{
				var name = $('#conteudoinner > h1:not([id])').text();
				var sigla = $('#conteudoinner > .formulario > tr > td:contains("Sigla") +td')[0].children[0].data;
				var codigo = $('#conteudoinner > .formulario > tr > td:contains("Código") +td')[0].children[0].data;
				var ativo = $('#conteudoinner > .formulario > tr > td:contains("Ativa?") +td')[0].children[0].data;
				var str = $('#conteudoinner > h2').text();
				var semestre = str.substring(str.length-1,str.length-2);
				var ano = 
				console.log(courseUnitUrl+ " nome: "+name+" ,sigla: "+sigla+" ,codigo: "+codigo+" ,semestre: "+semestre+" ,ativo: "+ativo+"\n");
				deferred.resolve(2);
			}
		}
	});

    return deferred.promise;
}


function getCourseUnitTeachers(courseUnit){
	var deferred = Q.defer();
	//console.log(courseUnit);
	deferred.resolve(2);
    return deferred.promise;
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

function Cadeira(nome, sigla, codigo)
{
	this.nome = nome;
	this.sigla = sigla;
	this.codigo = codigo;
	this.profs = new Array();
}

function Professor(nome,codigo)
{
	this.nome = nome;
	this.codigo = codigo;
}