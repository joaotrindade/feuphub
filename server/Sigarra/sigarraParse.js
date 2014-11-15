module.exports = (function() {
    'use strict';
	
	var api = express.Router();

	api.get('/', function(req, res) {
		//try{
			getCourses().then(function(results){console.log(JSON.stringify(results,undefined, 2)); res.send(results);}).done();
		//}catch(err) {console.log("\nError: \n");console.log(err);}
    });
	
    return api;

	
}(module || {}));

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
			
			Q.all(coursePromises).then(function (results) {
				deferred.resolve(results);
			});
			
		}
		else{
			console.log("falhou cursos:"+response.statusCode+", "+error+"\n");
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
			var curso = new Curso($('#conteudoinner').children()[2].children[0].data, $('.formulario tr:nth-last-child(5) td:not([class])')[0].children[0].data);
			var coursePlanUrl = 'http://sigarra.up.pt/feup/pt/' + $('.curso-informacoes div:nth-child(4) li a')[0].attribs.href;
			parseCoursePlan(coursePlanUrl,curso.sigla).then(function(data){
				//console.log("Feito curso:\n");
				//curso.cadeiras = data;
				//console.log(JSON.stringify(curso,undefined, 2));
				//console.log("\n\n");
				deferred.resolve(curso);
			});	
		}});
	
    return deferred.promise;
}


function parseCoursePlan(coursePlanUrl, courseAcronym){
	var deferred = Q.defer();
		
	request({
		url: coursePlanUrl,
		method: 'GET',
		encoding: null
	},function(error,response,body){
		if(error){
			console.log("parseCoursePlan: "+coursePlanUrl+ " failed\n");
			console.log(error);
			console.log("\n");
			deferred.reject();
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			
			var curso = $('#conteudoinner > h1:nth-child(3)')[0].children[0].data;		
			
			var courseUnitsHref = [];
			$('a[href*="ucurr_geral.ficha_uc_view"]').each(function(i, elem) {
				courseUnitsHref[i] = 'http://sigarra.up.pt/feup/pt/' + $(this)[0].attribs["href"];
			});
			
			var uniqueCourseUnits = courseUnitsHref.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			})
			
			var courseUnitPromises = uniqueCourseUnits.map(function(a) {return parseCourseUnit(a,courseAcronym);});
			
			Q.all(courseUnitPromises).then(function (results) {
				//console.log(JSON.stringify(results));
				//results.forEach(function(entry){});
				//console.log("\n");
				deferred.resolve(results);
			});
		}});
		
    return deferred.promise;
}

function parseCourseUnit(courseUnitUrl,courseAcronym)
{
	var deferred = Q.defer();
	
	request({
		url: courseUnitUrl,
		method: 'GET',
		encoding: null,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("parseCourseUnit: "+courseUnitUrl+ " failed\n");
			console.log(error);
			console.log("\n");
			deferred.reject();
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			if($('body').children().length ==0){
				parseCourseUnit($('a')[0].attribs["href"], courseAcronym).then(function(promise){
				deferred.resolve(promise);
				})
			}else{
				var nome = $('#conteudoinner > h1:not([id])').text();
				var sigla = $('#conteudoinner > .formulario > tr > td:contains("Sigla") +td')[0].children[0].data;
				var codigo = $('#conteudoinner > .formulario > tr > td:contains("Código") +td')[0].children[0].data;
				var ativo = $('#conteudoinner > .formulario > tr > td:contains("Ativa?") +td')[0].children[0].data;
				var aux = $('#conteudoinner > h2').text();
				var periodo = aux.substring(aux.length-1,aux.length-2);
				var courseUnitAcroynm = $('h3:contains("Ciclos de Estudo/Cursos") + .dados > tr > .k.t > a');
				var courseUnitYears = $('h3:contains("Ciclos de Estudo/Cursos") + .dados  > tr >td:nth-child(4)');				
				var found = false;
				
				for(var i=0; i< courseUnitAcroynm.length;i++)
				{
					if(courseUnitAcroynm[i].children[0].data==courseAcronym){
						found = true;
						
						var ano = courseUnitYears[i].children[0].data;						
						
						//console.log(courseAcronym+" "+courseUnitUrl+ " nome: "+nome+", sigla: "+sigla+", codigo: "+codigo+", ano: "+ano+", semestre: "+periodo+", ativo: "+ativo+"\n");
						
						aux = $('.horas > .dados > tr >td > a[href*="func_geral"]');
						var teacherUrls = [];
						var n = courseUnitUrl.search("ucurr_geral");
						var substr = courseUnitUrl.substring(0,n);
						for(var j=0; j<aux.length; j++)
						{
							teacherUrls.push(substr+aux[j].attribs["href"]);
						}
												
						var teacherPromises = teacherUrls.map(function(a) {return parseTeacher(a);});
			
						Q.all(teacherPromises).done(function (results) {
							var cadeira = new Cadeira(nome, sigla, codigo, new Semestre(ano, periodo), ativo);
							cadeira.profs = results;
							//console.log("teacher: \n");
							//console.log(results);
							//console.log("\n\n");
							deferred.resolve(cadeira);
						});
						
						break;
					}
				}
				if(found)
					return;
				else{
				
					console.log("no match in "+courseUnitUrl+" of : "+courseAcronym+" in array of size: "+courseUnitAcroynm.length+"\n");
					for(var i=0; i< courseUnitAcroynm.length;i++)
					{
						console.log(courseUnitAcroynm[i].children[0].data+" vs "+courseAcronym+"\n");
					}
					
					console.log("falhou cadeira\n");
					deferred.reject();
				}
			}
		}
	});

    return deferred.promise;
}


function parseTeacher(teacherUrl){
	var deferred = Q.defer();
	request({
		url: teacherUrl,
		method: 'GET',
		encoding: null,
		followAllRedirects: true
	},function(error,response,body){
		if(error){
			console.log("parseTeacher: "+teacherUrl+ " failed\n");
			console.log(error);
			console.log("\n");			
			deferred.reject();
		}else if (response.statusCode == 200) {
			var html = iconv.decode(new Buffer(body), "iso-8859-15");
			$ = cheerio.load(html);
			
			var fotoUrl = $('.informacao-pessoal-dados-foto > img').attr('src');
			var nome = $('.informacao-pessoal-dados-dados > .tabela > tr:nth-child(1) > td:nth-child(2) > b').text();
			var codigo = $('.informacao-pessoal-dados-dados > .tabela > tr:nth-child(3) > td:nth-child(2)').text();

			var aux = fotoUrl.substring(0, 9);

			var res = fotoUrl;
			if(aux== "/feup/pt/")
				res=fotoUrl.substring(9,fotoUrl.length);
			
			var str = "https://sigarra.up.pt/feup/pt/" + res;
			var prof = new Professor(nome, codigo, str);
			deferred.resolve(prof);
			
		}
	});

    return deferred.promise;
}

function Curso(nome, sigla)
{
	this.nome = nome;
	this.sigla = sigla;
	this.cadeiras = new Array();
}

function Semestre(ano, periodo)
{
	this.ano = ano;
	this.periodo = periodo;
}

function Cadeira(nome, sigla, codigo, semestre, ativo)
{
	this.nome = nome;
	this.sigla = sigla;
	this.codigo = codigo;
	this.semestre = semestre;
	this.ativo = ativo;
	//this.profs = new Array();
}

function Professor(nome,codigo,foto)
{
	this.nome = nome;
	this.codigo = codigo;
	this.foto = foto;
}