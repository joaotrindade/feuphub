Ember.FEATURES["query-params"]=true;

App = Ember.Application.create();

App.Router.map(function() {
  this.resource('mieic');
  this.resource('anos');
  this.resource('topic');
  this.resource('login');
  this.resource('cursos');
  this.route('articles');
  this.route('photos');
  this.route('credentials');
  this.route('cadeiras');
});

var usrname = "";

App.ApplicationController = Ember.Controller.extend({
  page: "Trek"
});

//LOGIN

App.LoginRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.reset();
  }
});

App.AuthenticatedRoute = Ember.Route.extend({

  beforeModel: function(transition) {
    if (!this.controllerFor('login').get('token')) {
      this.redirectToLogin(transition);
    }
  },

  redirectToLogin: function(transition) {
    alert('You must log in!');

    var loginController = this.controllerFor('login');
    loginController.set('attemptedTransition', transition);
    this.transitionTo('login');
  },

  getJSONWithToken: function(url) {
    var token = this.controllerFor('login').get('token');
    return $.getJSON(url, { token: token });
  },
  
  postJSONWithToken: function() {
    var token = this.controllerFor('login').get('token');
	return token;
  },
  
  getUsername: function() {
    var usr = this.controllerFor('login').get('usr');
	return usr;
  },

  events: {
    error: function(reason, transition) {
      if (reason.status === 401) {
        this.redirectToLogin(transition);
      } else {
        alert('Something went wrong');
      }
    }
  }
});


// Controllers

App.MieicController = Ember.ObjectController.extend({
	queryParams: ['ano'],
	isExpanded: false,
	ano: null,
	
	getAno: function(){
		var ano = this.get('ano');
		if(ano==null)
		{
			this.set('isExpanded', false);
		}
		else
		{
			this.set('ano', this.get('ano'));
			this.set('isExpanded', true);
		}
	}.property('ano'),
	
	actions: {
       
        upvotetopic: function(id) {
            alert("Fazer Upvote Ao Topico com id= " + id);
        },
       
        downvotetopic: function(id) {
            alert("Fazer Upvote Ao Topico com id= " + id);
        }
    }
	
	
});

App.CursosController = Ember.ObjectController.extend({
	queryParams: ['codigo'],
	codigo:null,
		
	getCursoTopics: function(){
		this.set('codigo', this.get('codigo')); 
		alert(this.codigo);
		
		var apigo = "/api/database/topico/" + this.codigo.toUpperCase();
		
		$.post(apigo).then( function(response)
		{
		  if (response.success)
		  {
			for(x=0;x<response.results.length;x++) 
			{
				var scorediff = response.results[x].upvote -  response.results[x].downvote;
				$("#content").append("<div class='topic'>");
				$("#content").append("<div class='score'>(<div {{action 'upvotetopic' " + response.results[x].id + " }} class='upvote'></div> <div class='number'>" + scorediff + "</div> <div {{action 'downvotetopic' " + response.results[x].id + " }}  class='downvote'></div></div>");
				$("#content").append("<div class='comments'></div>");
				$("#content").append("{{#link-to 'topic' class='linkto-none' (query-params idtopico="+response.results[x].id+")}} <div class='title'>" + response.results[x].titulo + "</div> {{/link-to}}");
				$("#content").append("<div class='data'>" + response.results[x].data + "</div>");
				$("#content").append("<div class='user_op'>" + response.results[x].UtilizadorKey + "</div>"); //TODO - SELECT DEVOLVER O USERNAME DO CRIADOR
				$("#content").append("</div>");
			}
		  }
		  else
				alert("POIS, JA SABIA QUE IA DAR MAL");
		});
		
	}.property('codigo')
});
  
App.LoginController = Ember.Controller.extend({

  reset: function() {
    this.setProperties({
      username: "",
      password: "",
	  loginSuccess: "",
      errorMessage: ""
    });
  },

  token: localStorage.token,
  tokenChanged: function() {
    localStorage.token = this.get('token');
  }.observes('token'),
  
  usr: localStorage.usr,
  usrChanged: function() {
    localStorage.usr = this.get('usr');
  }.observes('usr'),

  login: function() {

    var self = this, data2 = this.getProperties('username', 'password');

    // Clear out any error messages.
    this.set('errorMessage', null);
	$('#bttn').click(function(event) {   
     event.preventDefault(event);  
	});	
		
		$('#spinner').fadeIn(100);
		$('#spinner #statusText').text("Validating your login with SIFEUP");
		
		var username = this.get('username');
		var password = this.get('password');
			
		setTimeout(function(){

			$.ajax({
				type: "POST",
				url: "/api/sigarra/login",
				data: {'username':username,'password':password},
				async: false,
				beforeSend : function(){
				},
				success: function(data, textStatus, jqXHR)
				{
					if(data.headers["set-cookie"].length >1)
					{
						//set sigarra cookies
						document.cookie=data.headers["set-cookie"][0];
						document.cookie=data.headers["set-cookie"][1];
						$('#spinner #statusText').text("Login successful!");
						self.set('loginSuccess', "able");
						//alert(self.get('loginSuccess'));
						var datan = self.getProperties('username', 'password','loginSuccess');
						setTimeout(function(){ getCourses(username);},1000);
						$.post('/api/auth/authenticate', datan).then(function(response) {

						  self.set('errorMessage', response.message);
						  if (response.success) {
							//alert('Login succeeded!');
							//alert(response.token);
							self.set('token', response.token);
							self.set('usr',self.get('username'));
							usrname = self.get('username');
							//alert(self.get('token'));
							var attemptedTransition = self.get('attemptedTransition');
							if (attemptedTransition) {
							  attemptedTransition.retry();
							  self.set('attemptedTransition', null);
							} else {
							  // Redirect to 'articles' by default.
							  self.transitionToRoute('index');
							}
						  }
						});
					}
					else{
						$('#spinner #statusText').text("incorrect sifeup login credentials");
						setTimeout(function(){$('#spinner').stop().fadeOut(500);},1000);
					}
				}
			});
		}, 1000);
  }
});

App.CadeirasRoute = App.AuthenticatedRoute.extend({
  model: function() {
	alert(this.getUsername());
	 $.post('/api/database/cadeira/', {"token": this.postJSONWithToken()}).then(function(response) {
		if (response.success) {
			$("#cadeiras").append("<table>");
			$("#cadeiras").append("<tr><th>Codigo</th><th>Nome</th><th>Sigla</th><th>Ano</th><th>Semestre</th></tr>");
			for(x=0;x<response.results.length;x++) {
				$("#cadeiras").append("<tr><td>" + response.results[x].codigo + "</td><td>" + response.results[x].nome + "</td><td>" + response.results[x].sigla + "</td><td>" + response.results[x].ano + "</td><td>" + response.results[x].semestre + "</td></tr>");
			}
			$("#cadeiras").append("</table>");
		}
	 });
  }
});


App.TopicController = Ember.ObjectController.extend({
   
    actions: {
        subcomment: function() {
         
          var usr = this.controllerFor('login').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN , SENAO DA UNDEFINED
          alert(usr);
          if(usr != null)
          {
                        var text = document.getElementById("commentarea").value;
                        alert(text);
                       
                        var token = this.controllerFor('login').get('token');
						alert(token);
                       
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //Janeiro = 0!
                        var yyyy = today.getFullYear();
 
                        if(dd<10) {
                                dd='0'+dd
                        }
 
                        if(mm<10) {
                                mm='0'+mm
                        }
 
                        today = yyyy+'-'+mm+'-'+dd;
						
                        $.post('/api/database/resposta/', {"token": token, "id_questao" : 1, "texto" : text, "data" : today, "userid" : usr}).then( function(response)
                        {
                          if (response.success)
                          {
                                alert("JA INSERI");
                          }
                          else
                                alert("POIS, JA SABIA QUE IA DAR MAL");
                        });
               
          }
          else
            alert("NAO FEZ LOGIN, NAO PODE COMENTAR");
        },
       
        upvotecomment: function(id) {
            alert("Fazer Upvote Ao Comentario com id= " + id);
        },
       
        downvotecomment: function(id) {
            alert("Fazer Upvote Ao Comentario com id= " + id);
        }
    }
});


//EXEMPLO DE ACEDER A UMA PAGINA COM O TOKEN

/*App.ArticlesRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.getJSONWithToken('/articles.json');
  }
});

App.PhotosRoute = App.AuthenticatedRoute.extend({
  model: function() {
    return this.getJSONWithToken('/photos.json');
  }
});*/


//END LOGIN

function getCourses(username){
	$('#spinner #statusText').text("Getting your courses from sigarra (may take a while...)");
	var courses;

	setTimeout(function(){

		$.ajax({
			type: "GET",
			url: "/api/sigarra/getStudentCourses",
			data: "pv_login="+username,
			success: function(data, textStatus, jqXHR)
			{
				//var json = JSON.parse(data);
				
				if(data.statusCode == 200)
				{
					$('#spinner #statusText').text("Done! Here they are");
					courses=data.body;
					console.log(courses);
					var vec = [];
					var obj = JSON.parse(data.body);
					var k=0;
					$("#disciplinas").empty();
					for(y=0;y<obj.length;y++) {
						for(x=0;x<obj[y]["inscricoes"].length;x++) {
							$("#disciplinas").append("<li>" + obj[y]["cur_nome"] + " - " + obj[y]["inscricoes"][x]["ucurr_sigla"] + "</li>");
							vec.push(obj[y]["inscricoes"][x]["ucurr_sigla"]);
						}
					}
					console.log(vec);
				}
				else
				{
					$('#spinner #statusText').text("Something went wrong...");
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				$('#spinner #statusText').text("Something happened to sigarra...");
			},
			complete: function(data){
				logoff();
				setTimeout(function(){$('#spinner').stop().fadeOut(500);},500);
			}
		});
	},1000);	
}

function logoff(){
	if(clearCookies())
	{
		$.ajax({
		type: "POST",
		url: "/api/sigarra/logout",
		async: false,
		success: function(data, textStatus, jqXHR)
		{}
	});
	}
	return;
}

function clearCookies(){

	var cleared=false;
	if(document.cookie.indexOf("HTTP_SESSION") >= 0){
		document.cookie = "HTTP_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		cleared=true;
	}
	if(document.cookie.indexOf("SI_SESSION") >= 0){
		document.cookie = "SI_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		cleared=true;
	}
	if(document.cookie.indexOf("SI_SECURITY") >= 0){
		document.cookie = "SI_SECURITY" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		cleared=true;
	}
	return cleared;
}

function func(data)
{
	if(data) //has data
	{
		alert(data);
	}
	return;
}

function parserLogin(input_html){
	/* PARSES PCT_ID */
	var e1 = document.createElement( 'div' );
	e1.innerHTML = input_html;
	var url = e1.querySelector('.autenticacao-nome').href;
	e1.innerHTML = "";
	e1 = null;
	var temp = url.split("=")
	var value = temp[1];
	return value;
}

function parserNumUnico(input_html)
{
	/* PARSES PV_FEST_ID */
	var e1 = document.createElement( 'div' );
	e1.innerHTML = input_html;
	var url = e1.querySelector('a').href;
	e1.innerHTML = "";
	e1 = null;
	var temp = url.split("=")
	var value = temp[1];
	return value;
}

function parserPVFEST(input_html)
{
	/* PARSES PV_FEST_ID */
	var e1 = document.createElement( 'div' );
	e1.innerHTML = input_html;
	var url = e1.querySelector("a[title~='Visualizar']").href;
	e1.innerHTML = "";
	e1 = null;
	var temp = url.split("=")
	var value = temp[1];
	return value;
}

function parserPercurso()
{
	var input_html = document.getElementById('textfield').value;
	var handler = document.createElement( 'div' );
	handler.innerHTML = input_html;
	var tableRowsNodeList = handler.querySelectorAll('#tabelapercurso  .p, #tabelapercurso .i');
	var jsonData = [];

	for (var i = 0; i < tableRowsNodeList.length ; i++ )
	{
		var ucYear = tableRowsNodeList[i].querySelector('.k.l');
			if (ucYear != null) ucYear = ucYear.firstChild.data;
		var ucCode = tableRowsNodeList[i].querySelector('.k.t');
			if (ucCode != null) ucCode = ucCode.firstChild.text;
		var ucName = tableRowsNodeList[i].querySelector('.unidade-curricular')
			if (ucName != null) ucName = ucName.text;
		var ucApproved = false;
		var aprovado = tableRowsNodeList[i].querySelector('.aprovado');
		if (aprovado != null)
			ucApproved = true;
		var firstTimeStudent = false;

		var hasYellowCell = tableRowsNodeList[i].querySelector('.n.nao-aprovado');
		if (hasYellowCell != null)
		{
			if (hasYellowCell.firstChild == null)  firstTimeStudent = true;
		}
		else firstTimeStudent = false;

		if (ucYear != null && ucCode != null && ucName != null && firstTimeStudent == false)
		{
			var ucData = {'year':ucYear, "code":ucCode, "name":ucName, "approved":ucApproved} ;
			jsonData.push(ucData);
		}
		/* Testing only */

			//if (ucApproved) alert(ucYear + " - " + ucCode + " - " + ucName + " - Aprovado" );
			//else alert(ucYear + " - " + ucCode + " - " + ucName + " - Nao Aprovado" );

		/* ------------ */
	}
	//console.log(jsonData);
	return jsonData;
}