Ember.FEATURES["query-params"]=true;

App = Ember.Application.create({
  currentPath: '',
});

App.Router.map(function() {
  this.resource('mieic');
  this.resource('anos');
  this.resource('topic');
  this.resource('home');
  this.resource('cursos');
  this.resource('createtopic');
  this.resource('givefeedback');
  this.resource('viewfeedbacks');
  this.route('articles');
  this.route('photos');
  this.route('credentials');
  this.route('cadeiras');
  this.resource('account');
});

var usrname = "";

App.ApplicationController = Ember.Controller.extend({
  page: null,
  isVisibleHeader: true,
  loggedIn:null,
  numero:null,
	
	updateCurrentPath: function() {
		App.set('currentPath', this.get('currentPath'));
		if (App.get('currentPath') == 'index')
		{
			this.set('isVisibleHeader',false);
		}
	}.observes('currentPath'),
	
	checkIsLoggedIn:function(){
		var self=this;
		var variavel = this.controllerFor('index').get('usr');
		if(variavel!="")
		{
			var apigo = '/api/database/utilizador';
			var tok = this.controllerFor('index').get('token');
			var us = this.controllerFor('index').get('usr');
			$.post(apigo, {"token":tok, "numero":us}).then( function(response)
			{
				if (response.success)
				{
					self.set('numero', response.results[0].nickname);
				}
				else
					alert("Algo deu Errado.");
			});
			this.set('loggedIn',true);
		}
		else
		{
			this.set('loggedIn',false);
		}
	}.observes('currentPath'),
});

// ROUTES -----------------------------------------------------------------------------------

//LOGIN

App.IndexRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.reset();
  },
  actions: 
	{
		willTransition: function(transition)
		{
			var indexController = this.controllerFor('index');
			indexController.set('controllers.application.isVisibleHeader', true);
		}
	}
});

App.AuthenticatedRoute = Ember.Route.extend({

  beforeModel: function(transition) {
    if (!this.controllerFor('index').get('token')) {
      this.redirectToLogin(transition);
    }
  },

  redirectToLogin: function(transition) {
    alert('You must log in!');

    var loginController = this.controllerFor('index');
    loginController.set('attemptedTransition', transition);
    this.transitionTo('login');
  },

  getJSONWithToken: function(url) {
    var token = this.controllerFor('index').get('token');
    return $.getJSON(url, { token: token });
  },
  
  postJSONWithToken: function() {
    var token = this.controllerFor('index').get('token');
	return token;
  },
  
  getUsername: function() {
    var usr = this.controllerFor('index').get('usr');
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

App.CursosRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.getCursoTopics();
  }
});


App.TopicRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.getData();
  }
});

App.CreatetopicRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.initialCreateTopic();
  }
});

App.GivefeedbackRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.initialGiveFeedback();
  }
});

App.ViewfeedbacksRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.getFeedbacks();
  }
});

App.AccountRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.getAccount();
  }
});

/*------------------------------------------------------------------------------------------*/

// CONTROLLERS ------------------------------------------------------------------------------

App.AccountController = Ember.ObjectController.extend({
	needs:['index'],
	nickname:null,
	email:null,
	feedbacksuser:null,
	utilizadorId:null,
	
	getAccount: function(){
		var self = this;
		var usr = this.get('controllers.index').get('usr');
		var token = this.get('controllers.index').get('token');
		var apigo = 'api/database/utilizador/';
		var apigo2 = "/api/database/feedback/" + usr;
		
		this.set('feedbacksuser',null);
		this.set('email',null);
		this.set('nickname',null);
		this.set('utilizadorId',usr);
		
		$.post(apigo, {"token":token, "numero":usr}).then( function(response)
		{
			if (response.success)
			{
				self.set('nickname', response.results[0].nickname);
				self.set('email', response.results[0].email);
			}
			else
				alert("Algo deu Errado.");
		});
		
		$.post(apigo2, {"token": token}).then( function(response2) // PEDIR UMA API QUE RETORNE APENAS 5 FEEDBACKS
		{
		  if (response2.success)
		  {	
				self.set('feedbacksuser', response2.results);
		  }
		  else
				alert("Algo deu Errado.");
		});
		
		//TODO $POST - PEDIR AO NEVES PARA, DADO O USERID, RECEBER OS TOPICOS CRIADOS POR ELE
		
		//TODO $POST - PEDIR AO NEVES PARA, DADO O USERID, RECEBER OS TOPICOS COMENTADOS POR ELE
		
		//TODO $POST - PEDIR AO NEVES PARA FAZER API PARA FAZER UPDATE AOS CAMPOS
	},
	
	actions: {  
        actionEdit: function(id) {
            if(id == "edit_username")
			{
				$("#edit_username").hide();
				$("#new_user").show("slow");
				
			} else if(id == "edit_email")
			{
				$("#edit_email").hide();
				$("#new_email").show("slow");
			}
        },
		actionCloseEdit: function(id) 
		{
			if(id == "edit_username")
			{
				$("#edit_username").show();
				$("#new_user").hide("slow");
				
			} else if(id == "edit_email")
			{
				$("#edit_email").show();
				$("#new_email").hide("slow");
			}
		}
    }
});

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
	needs:['index'],
	queryParams: ['codigo'],
	codigo:null,
	topicscurso:null,
	feedbackscurso:null,
	
	isMieic:false,
	isMieec:false,
	isMieig:false,
	isMiea:false,
	isMiec:false,
	isMib:false,
	isMiem:false,
	isMiemm:false,
	isMieq:false,
	
	getCursoTopics: function(){
		var self = this;
		this.set('topicscurso', null);
		this.set('feedbackscurso', null);		
		this.set('codigo', this.get('codigo')); 
		
		//GET TOPICOS DE UM CURSO
		var apigo = "/api/database/topico/" + this.codigo.toUpperCase();
		
		$.post(apigo).then( function(response)
		{
		  if (response.success)
		  {
			self.set('topicscurso', response.results);
		  }
		  else
				alert("Algo deu Errado.");
		});
		
		//GET FEEDBACK DE UM CURSO
		var token = this.get('controllers.index').get('token');
		var apigo2 = "/api/database/feedback/" + this.codigo.toUpperCase();
		
		$.post(apigo2, {"token": token, "type" : "curso", "type2": "get5"}).then( function(response2) // SE FOR GET5 DEVOLVE 5 APENAS, SE FOR GET DEVOLVE TODOS.
		{
		  if (response2.success)
		  {	
				self.set('feedbackscurso', response2.results);
		  }
		  else
				alert("Algo deu Errado.");
		});
		
	},
	
	checkLogo: function(){
		this.set('isMieic', false);
		this.set('isMieec', false);
		this.set('isMieig', false);
		this.set('isMiea', false);
		this.set('isMiec', false);
		this.set('isMib', false);
		this.set('isMiem', false);
		this.set('isMiemm', false);
		this.set('isMieq', false);
		
		if(this.codigo == "mieq")
		{
			this.set('isMieq', true);
		}else if (this.codigo == "mieic")
		{
			this.set('isMieic', true);
		}else if (this.codigo == "mieec")
		{
			this.set('isMieec', true);
		}else if (this.codigo == "mieig")
		{
			this.set('isMieig', true);
		}else if (this.codigo == "miea")
		{
			this.set('isMiea', true);
		}else if (this.codigo == "miec")
		{
			this.set('isMiec', true);
		}else if (this.codigo == "mib")
		{
			this.set('isMib', true);
		}else if (this.codigo == "miem")
		{
			this.set('isMiem', true);
		}else if (this.codigo == "miemm")
		{
			this.set('isMiemm', true);
		}
	}.property('codigo'),
	
	actions: {
       
        upvotetopic: function(id) {
            var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;
			
			if(usr != null)
			{
				var token = this.get('controllers.index').get('token');
				var apigo = "/api/database/topico/up/" + id;
				
				$.post(apigo, {"token":token, "idUser":usr}).then( function(response)
				{
					if (response.success)
					{
						self.get('topicscurso').forEach(function(item){ 

							var temporary = item.difference;
							
							if(response.results.tipo == "inseriu" && item.id == id)
							{
								temporary +=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "retirou" && item.id == id)
							{
								temporary -=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "trocou" && item.id == id)
							{
								temporary +=2;
								Ember.set(item, "difference",	temporary); 
							}
							
						});
					}
					else
						alert("ALGO DEU MAL NO UPVOTE");
				});
			}
			else
				alert("Faça Login para fazer upvote");
        },
       
        downvotetopic: function(id) {
            var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;

			if(usr != null)
			{
				var token = this.get('controllers.index').get('token');
				var apigo = "/api/database/topico/down/" + id;
				
				$.post(apigo, {"token":token, "idUser":usr}).then( function(response)
				{
				  if (response.success)
				  {
						self.get('topicscurso').forEach(function(item){ 

							var temporary = item.difference;
							
							if(response.results.tipo == "inseriu" && item.id == id)
							{
								temporary -=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "retirou" && item.id == id)
							{
								temporary +=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "trocou" && item.id == id)
							{
								temporary -=2;
								Ember.set(item, "difference",	temporary); 
							}
							
						});
				  }
				  else
						alert("ALGO DEU MAL NO DOWNVOTE");
				});
			}
			else
				alert("Faça Login para fazer downvote");
        }
    }
});
 
App.TopicController = Ember.ObjectController.extend({
	needs: ['index'],
	queryParams: ['topicoid'],
	topicoid:null,
	topicoDetails:null,
	topicoRespostas:null,
	isMine:null,
	
	getData: function(){
		var self = this;
		
		var usr = this.get('controllers.index').get('usr');
		
		this.set('topicoDetails', null);
		this.set('topicoRespostas', null);
		this.set('isMine',null);
		
		this.set('topicoid', this.get('topicoid')); 
		//alert(this.topicoid);
		
		var apigo = "/api/database/topico/id/" + this.topicoid;
		var apigo2 = "/api/database/resposta/" + this.topicoid;
		
		$.post(apigo).then( function(response)
		{
		  if (response.success)
		  {
			self.set('topicoDetails', response.results[0]);
			
			if(response.results[0].numero == usr)
			{
				self.set('isMine',true); 
			}
			else
			{
				self.set('isMine',false);
			}
			
			$.post(apigo2).then( function(response)
			{
			  if (response.success)
			  {
				self.set('topicoRespostas', response.results);
			  }
			  else
					alert("Algo deu Errado.");
			});
			
		  }
		  else
				alert("Algo deu Errado.");
		});
		
	},
	
    actions: {
        subcomment: function() {
        
          var usr = this.controllerFor('index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN , SENAO DA UNDEFINED
          //alert(usr);
          if(usr != null)
          {
                        var text = document.getElementById("commentarea").value;
						var iddoTopico = this.topicoid;
                        //alert(text);
                       
                        var token = this.controllerFor('index').get('token');
						//alert(token);
                       
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
						
                        $.post('/api/database/resposta/', {"token": token, "id_questao" : iddoTopico, "texto" : text, "data" : today, "userid" : usr}).then( function(response)
                        {
                          if (response.success)
                          {
								location.reload();
                          }
                          else
                                alert("Algo deu Errado.");
                        });
               
          }
          else
            alert("NAO FEZ LOGIN, NAO PODE COMENTAR");
        },
       
        upvotecomment: function(id) {
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;
		
			if(usr != null)
			{
				var token = this.get('controllers.index').get('token');
				var apigo = "/api/database/resposta/up/" + id;

				$.post(apigo, {"token":token, "idUser":usr}).then( function(response)
				{
				  if (response.success)
				  {
						self.get('topicoRespostas').forEach(function(item){ 

							var temporary = item.difference;
							
							if(response.results.tipo == "inseriu" && item.id == id)
							{
								temporary +=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "retirou" && item.id == id)
							{
								temporary -=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "trocou" && item.id == id)
							{
								temporary +=2;
								Ember.set(item, "difference",	temporary); 
							}
							
						});
				  }
				  else
						alert("ALGO DEU MAL NO UPVOTE");
				});
			}
			else
				alert("Faça Login para fazer upvote");
			
        },
       
        downvotecomment: function(id) {
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;
			
			if(usr != null)
			{
				var token = this.get('controllers.index').get('token');
				var apigo = "/api/database/resposta/down/" + id;
				
				$.post(apigo, {"token":token, "idUser":usr}).then( function(response)
				{
				  if (response.success)
				  {
						self.get('topicoRespostas').forEach(function(item){ 

							var temporary = item.difference;
							
							if(response.results.tipo == "inseriu" && item.id == id)
							{
								temporary -=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "retirou" && item.id == id)
							{
								temporary +=1;
								Ember.set(item, "difference",	temporary); 
							}
							else if(response.results.tipo == "trocou" && item.id == id)
							{
								temporary -=2;
								Ember.set(item, "difference",	temporary); 
							}
							
						});
				  }
				  else
						alert("ALGO DEU MAL NO DOWNVOTE");
				});
			}
			else
				alert("Faça Login para fazer downvote");
        },
		
		deletetopic: function(id) 
		{
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;
			
			if(usr != null && this.isMine == true)
			{
				var token = this.get('controllers.index').get('token');
				var apigo = "/api/database/topico/id/" + id;
				
				$.post(apigo, {"token":token, "idUser":usr, "type": "delete"}).then( function(response)
				{
				  if (response.success)
				  {
						alert("Topico Eliminado");
						self.transitionToRoute('cursos',{queryParams: {codigo: self.topicoDetails.CursoKey.toLowerCase()}});
				  }
				  else
						alert("ALGO DEU MAL A APAGAR O TOPICO");
				});
			}
			else
				alert("Faça Login para apagar topico");
        }
    }
});

App.CreatetopicController = Ember.ObjectController.extend({
	needs: ['index'],
	queryParams: ['cursoid','cadeiraid','feupid'],
	isQuestion: false,
	isNews: false,
	isPoll:false,
	cursoid: null,
	cadeiraid: null,
	feupid: null,
	
	initialCreateTopic: function(){
		this.set('isQuestion', true);
		this.set('isNews', false);		
		this.set('isPoll', false);

	},
	
	actions: {
       
        changetipo: function(tipo) {
            if(tipo==1)
			{
				this.set('isQuestion', true);
				this.set('isNews', false);		
				this.set('isPoll', false);
			}
			else if(tipo==2)
			{
				this.set('isQuestion', false);
				this.set('isNews', true);		
				this.set('isPoll', false);
			}
			else if(tipo==3)
			{
				this.set('isQuestion', false);
				this.set('isNews', false);		
				this.set('isPoll', true);
			}
        },
       
        subtopic: function() {
            
			var apigo = "/api/database/topico/" + this.cursoid.toUpperCase(); //TODO: ALTERAR PARA SER POSSIVEL CRIAR NAS CADEIRAS E NO FEUPMAINPAGE
			var self = this;
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN , SENAO DA UNDEFINED

			if(usr != null)
			{
						var titulo = document.getElementById("createtopic_title").value;
						var texto = document.getElementById("createtopic_description").value;

						var token = this.get('controllers.index').get('token');
						
						var tipo = null;
						
						if(this.isQuestion)
							tipo = 1;
						else if(this.isNews)
							tipo = 2;
						else if(this.isPoll)
							tipo = 3;
							
						/*alert(titulo);
						alert(texto);
						alert(tipo);*/
							
				$.post(apigo, {"token": token, "tipo" : tipo, "texto" : texto, "titulo" : titulo, "userid" : usr, "type": "insert"}).then( function(response)
				{
				  if (response.success)
				  {
						//alert("Inserido em MIEEC");
						self.transitionToRoute('cursos',{queryParams: {codigo: self.cursoid}});
				  }
				  else
						alert("Algo deu Errado.");
				});
			}
			else
			{
				alert("LOGIN PARA INSERIR TOPICO");
			}
        }
    }
	
	
});

App.GivefeedbackController = Ember.ObjectController.extend({
	needs: ['index'],
	queryParams: ['cursoid','cadeiraid','feupid'],
	cursoid: null,
	cadeiraid: null,
	feupid: null,
	
	initialGiveFeedback: function(){

	},
	
	actions: {
       
        subfeedback: function() {
		
			var apigo = "/api/database/feedback/";
			
			if(this.cursoid != "")
			{
				apigo = apigo + this.cursoid.toUpperCase();
			}
			else if(this.cadeiraid != "")
			{
				//apigo = apigo + TODO
			}
			
			var self = this;
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN , SENAO DA UNDEFINED

			if(usr != null)
			{
				var titulo = document.getElementById("givefeedback_title").value;
				var texto = document.getElementById("givefeedback_description").value;

				var token = this.get('controllers.index').get('token');
							
				$.post(apigo, {"token": token, "texto" : texto, "type" : "curso", "userid" : usr, "type2": "insert"}).then( function(response)
				{
				  if (response.success)
				  {
						if(self.cursoid != "")
						{
							self.transitionToRoute('cursos',{queryParams: {codigo: self.cursoid}});
						}
						else if(self.cadeiraid != "")
						{
							//self.transitionToRoute('cursos',{queryParams: {codigo: self.cursoid}}); TODO PARA CADEIRA
						}
				  }
				  else
						alert("Algo deu Errado.");
				});
			}
			else
			{
				alert("LOGIN PARA DAR FEEDBACK");
			}
        }
    }
	
	
});

App.ViewfeedbacksController = Ember.ObjectController.extend({
	needs: ['index'],
	queryParams: ['cursoid','cadeiraid','feupid','userid'],
	cursoid: null,
	cadeiraid: null,
	feupid: null,
	userid:null,
	nameof: null,
	feedbacks:null,
	isUser:null,
	
	getFeedbacks: function(){
		var self = this;
		this.set('nameof',null);
		
		var apigo = "/api/database/feedback/";
		var type = null;
		
		this.set('isUser',null);
		
		if(this.cursoid != "")
		{
			this.set('nameof',this.cursoid.toUpperCase());
			apigo = apigo + this.cursoid.toUpperCase();
			type="curso";
		}
		else if(this.cadeiraid != "")
		{
			this.set('nameof',this.cadeiraid.toUpperCase());
			type="cadeira";
			//apigo = apigo + TODO
		}
		else if(this.userid != "")
		{
			this.set('isUser',true);
			//TODO pedir neves para acrescentar verificação de usr no get de todos os feedbacks
			type="user";
		}
			
		//GET FEEDBACKS
		var token = this.get('controllers.index').get('token');
		
		$.post(apigo, {"token": token, "type" : type, "type2": "get"}).then( function(response) // SE FOR GET5 DEVOLVE 5 APENAS, SE FOR GET DEVOLVE TODOS.
		{
		  if (response.success)
		  {	
				self.set('feedbacks', response.results);
		  }
		  else
				alert("Algo deu Errado.");
		});

	},
	
	actions: {
       
        subfeedback: function() {
		
        }
    }
	
	
});

App.IndexController = Ember.Controller.extend({ 
	// TODO: SE FIZERMOS LOGIN ERRADO, ELE BATE MAL SE TENTARMOS LOGAR DE NOVO.
	needs: ['application'],
	
	calculaHeight: function(){
		var page = this;
		$(document).ready(function(){
			//calcula height da pagina
			var body = document.body;
			html = document.documentElement;
			var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
			var altura = height - 151;
			$(".midpage").css('height', altura);
		});
	}.property(),

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
	var userId;
	var datan;
	setTimeout(function(){

		$.ajax({
			type: "POST",
			url: "/api/sigarra/login",
			data: {'username':username,'password':password},
			async: false,
			success: function(data, textStatus, jqXHR)
			{
				if(data.headers["set-cookie"].length >1)
				{
					//set sigarra cookies
					document.cookie=data.headers["set-cookie"][0];
					document.cookie=data.headers["set-cookie"][1];
					$('#spinner #statusText').text("Login successful!");
					
					$.get('/api/sigarra/getPct_id').then(function(response)
					{
					
						self.set('errorMessage', response.message);
						if(response.statusCode = 200){
							userId = parserLogin(response.body);
							self.set('usr',userId);
						}
					}).then(function()
						{
							self.set('loginSuccess', "able");
							console.log("User identifier: "+ userId+"\n");
							datan = self.getProperties('username', 'password','loginSuccess');
							setTimeout(function(){ getCourses(username);},1000);
							
						}).then(function()
							{
								$.post('/api/auth/authenticate', datan).then(function(response) 
								{
									self.set('errorMessage', response.message);
									if (response.success) 
									{
										//alert('Login succeeded!');

										self.set('token', response.token);
										//self.set('usr',self.get('username'));
										//alert(self.get('token'));
										var attemptedTransition = self.get('attemptedTransition');
										self.transitionToRoute('home');
									}
								});
							});
				}
				else
				{
					$('#spinner #statusText').text("incorrect sifeup login credentials");
					setTimeout(function(){$('#spinner').stop().fadeOut(500);},1000);
				}
			}
		});
	}, 1000);
  },
});



/*------------------------------------------------------------------------------------------*/

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
	var data;
	
	if(username[0] >= '0' && username[0]<='9'){
		data = "pv_codigo="+username;
	}else{
		data = "pv_login="+username;
	}
		
	setTimeout(function(){

		$.ajax({
			type: "GET",
			url: "/api/sigarra/getStudentCourses",
			data: data,//"pv_login="+username,
			success: function(data, textStatus, jqXHR)
			{
				//var json = JSON.parse(data);
				
				if(data.statusCode == 200)
				{
					$('#spinner #statusText').text("Done! Here they are");
					courses=data.body;
					console.log("Cadeiras do aluno:\n\n");
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