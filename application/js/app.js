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
  this.resource('cadeiras');
  this.resource('account');
});

var usrname = "";

App.ApplicationController = Ember.Controller.extend({
  needs:['index'],
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
		var variavel = this.get('controllers.index').get('usr');
		if(variavel!="")
		{
			var apigo = '/api/database/utilizador';
			var tok = this.get('controllers.index').get('token');
			var us = this.get('controllers.index').get('usr');
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

App.CadeirasRoute = Ember.Route.extend({
  setupController: function(controller, context) {
    controller.getCadeiraTopics();
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
	new_username:null,
	topicoscriados:null,
	respostastopicos:null,
	
	
	getAccount: function(){
		var self = this;
		var usr = this.get('controllers.index').get('usr');
		var token = this.get('controllers.index').get('token');
		var apigo = 'api/database/utilizador/';
		var apigo2 = "/api/database/feedback/" + usr;
		var apigo3 = "/api/database/topico/" + usr;
		
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
		
		$.post(apigo3, {"token": token, "type":"user"}).then( function(response3)
		{
		  if (response3.success)
		  {	
				self.set('topicoscriados', response3.results);
		  }
		  else
				alert("Algo deu Errado.");
		});
		
		$.post(apigo3, {"token": token, "type":"userrespostas"}).then( function(response4)
		{
		  if (response4.success)
		  {	
				self.set('respostastopicos', response4.results);
		  }
		  else
				alert("Algo deu Errado.");
		});
		
		//TODO $POST - PEDIR AO NEVES PARA, DADO O USERID, RECEBER OS TOPICOS COMENTADOS POR ELE
		
		//TODO $POST - PEDIR AO NEVES PARA, DADO O USERID, RECEBER O FEEDBACK
		
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
		},
		updateInfo: function(type)
		{
			var self=this;
			var usr = this.controllerFor('index').get('usr');
			var texto = this.get('new_username');
			var token = this.controllerFor('index').get('token');
			var apigo3 = "/api/database/utilizador/" + usr;
			$.post(apigo3, {"token": token, "numero":usr, "type":type, "valor":texto}).then( function(response3)
			{
			  if (response3.success)
			  {	
					self.set('nickname',self.get('new_username'));
					self.controllerFor('application').set('numero',self.get('new_username'));
			  }
			  else
					alert("Algo deu Errado nos updates.");
			});
		}
    }
});

App.CadeirasController = Ember.ObjectController.extend({
	needs:['index'],
	queryParams: ['sigla','codigo'],
	topicosCadeira: [],
	feedbackscadeira: null,
	sigla: null,
	codigo: null,
	curso: null,
	ano: null,
	
	isMieic:false,
	isMieec:false,
	isMieig:false,
	isMiea:false,
	isMiec:false,
	isMib:false,
	isMiem:false,
	isMiemm:false,
	isMieq:false,
	
	getCadeiraTopics: function(){
		this._super();
		var sigla = this.get('sigla');
		var codigo = this.get('codigo');
		
		this.set('topicosCadeira', []);
		this.set('feedbackscadeira', null);	
		
		this.set('isMieic', false);
		this.set('isMieec', false);
		this.set('isMieig', false);
		this.set('isMiea', false);
		this.set('isMiec', false);
		this.set('isMib', false);
		this.set('isMiem', false);
		this.set('isMiemm', false);
		this.set('isMieq', false);
		
		var self = this;
		var token = this.get('controllers.index').get('token');
		var apigo = "/api/database/cadeira/" + codigo;
		
		$.get(apigo, function(data) {
			//console.log(data);
			if(data.success == true)
			{
				self.curso = data.results[0].CursoKey;
				self.ano = data.results[0].ano;
				self.sigla = data.results[0].sigla;
				
				if(self.curso == "MIEQ")
				{
					self.set('isMieq', true);
				}else if (self.curso == "MIEIC")
				{
					self.set('isMieic', true);
				}else if (self.curso == "MIEEC")
				{
					self.set('isMieec', true);
				}else if (self.curso == "MIEIG")
				{
					self.set('isMieig', true);
				}else if (self.curso == "MIEA")
				{
					self.set('isMiea', true);
				}else if (self.curso == "MIEC")
				{
					self.set('isMiec', true);
				}else if (self.curso == "MIB")
				{
					self.set('isMib', true);
				}else if (self.curso == "MIEM")
				{
					self.set('isMiem', true);
				}else if (self.curso == "MIEMM")
				{
					self.set('isMiemm', true);
				}
				
				var apigo2 = "/api/database/topico/" + codigo;
		
				$.post(apigo2, {"token": token, "type" : "getTopicosCadeira"}).then( function(response)
				{
				  if (response.success)
				  {
					self.set('topicosCadeira', response.results);
					
						//GET FEEDBACK DE UM CADEIRA
						var apigo3 = "/api/database/feedback/" + codigo;
						
						$.post(apigo3, {"token": token, "type" : "cadeira", "type2": "get5"}).then( function(response3) // SE FOR GET5 DEVOLVE 5 APENAS, SE FOR GET DEVOLVE TODOS.
						{
						  if (response3.success)
						  {	
								self.set('feedbackscadeira', response3.results);
						  }
						  else
								alert("Algo deu Errado.");
						});
						
				  }
				  else
						alert("Algo deu Errado No Get Topicos Cadeiras.");
				});
			}
		});
	},
	
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
						self.get('topicosCadeira').forEach(function(item){ 

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
						self.get('topicosCadeira').forEach(function(item){ 

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

    }
	
	
});

App.CursosController = Ember.ObjectController.extend({
	needs:['index'],
	queryParams: ['codigo'],
	codigo:null,
	topicscurso:null,
	feedbackscurso:null,
	cadeiras1ano: [],
	cadeiras2ano: [],
	
	isMieic:false,
	isMieec:false,
	isMieig:false,
	isMiea:false,
	isMiec:false,
	isMib:false,
	isMiem:false,
	isMiemm:false,
	isMieq:false,
	
	isExpanded:false,
	
	getCursoTopics: function(){
		var self = this;
		this.set('topicscurso', null);
		this.set('feedbackscurso', null);		
		this.set('codigo', this.get('codigo')); 
		this.set('isExpanded', false);
		
		this.set('cadeiras1ano',[]);
		this.set('cadeiras2ano',[]);
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
        },
		
		yearExpanded: function(year){
			this._super();
			
			this.set('isExpanded', true);
			
			this.set('cadeiras1ano',[]);
			this.set('cadeiras2ano',[]);
			
			
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN (SEM DAR WARNING DE REPRECATED) , SENAO DA UNDEFINED
			var self = this;

			var token = this.get('controllers.index').get('token');
			var apigo = "/api/database/cadeira/cadeiraMenu/";
			var curso = this.codigo.toUpperCase();
			
			$.post(apigo, { "idCurso" : curso, "ano" : year} ).then( function(response)
			{
			  if (response.success)
			  {
					//console.log(response.results);
					response.results.forEach(function(item){ 
						if(item.semestre == 1)
						{
							self.cadeiras1ano.addObject(item);
						}
						else if(item.semestre == 2)
						{
							self.cadeiras2ano.addObject(item);
						}
					});

			  }
			  else
					alert("ALGO DEU MAL NO GET DISICIPLINAS");
			});

		},
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
        },
		
		upvotetopic: function(id) {
			this._super();
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
							var temporary = self.topicoDetails.difference;
							
							if(response.results.tipo == "inseriu")
							{
								temporary +=1;
								Ember.set(self.topicoDetails, "difference",	temporary); 
							}
							else if(response.results.tipo == "retirou")
							{
								temporary -=1;
								Ember.set(self.topicoDetails, "difference",	temporary); 
							}
							else if(response.results.tipo == "trocou")
							{
								temporary +=2;
								Ember.set(self.topicoDetails, "difference",	temporary); 
							}
					}
					else
						alert("ALGO DEU MAL NO UPVOTE");
				});
			}
			else
				alert("Faça Login para fazer upvote");
        },
       
        downvotetopic: function(id) {
			this._super();
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

						var temporary = self.topicoDetails.difference;
						
						if(response.results.tipo == "inseriu")
						{
							temporary -=1;
							Ember.set(self.topicoDetails, "difference",	temporary); 
						}
						else if(response.results.tipo == "retirou")
						{
							temporary +=1;
							Ember.set(self.topicoDetails, "difference",	temporary); 
						}
						else if(response.results.tipo == "trocou")
						{
							temporary -=2;
							Ember.set(self.topicoDetails, "difference",	temporary); 
						}
				  }
				  else
						alert("ALGO DEU MAL NO DOWNVOTE");
				});
			}
			else
				alert("Faça Login para fazer downvote");
        },
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
            
			var apigo = null;
			var type = "vazio";
			
			if(this.cursoid != "")
			{
				apigo = "/api/database/topico/" + this.cursoid.toUpperCase();
				type = "insert";
			}
			else if(this.cadeiraid != "")
			{
				apigo = "/api/database/topico/" + this.cadeiraid;
				type = "insertCadeira";
			}
			else if(this.feupid != "")
			{
				apigo = "/api/database/topico/FEUP";
				type ="inserFeup";
			}
			
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
							
						/*alert(usr);
						alert(token);
						alert(tipo);*/
							
				$.post(apigo, {"token": token, "tipo" : tipo, "texto" : texto, "titulo" : titulo, "userid" : usr, "type": type}).then( function(response)
				{
				  console.log(response);
				  if (response.success)
				  {
						if(self.cursoid != "")
						{
							self.transitionToRoute('cursos',{queryParams: {codigo: self.cursoid}});
						}
						else if(self.cadeiraid != "")
						{
							self.transitionToRoute('cadeiras',{queryParams: {codigo: self.cadeiraid}});
						}
						else if(self.feupid != "")
						{
							self.transitionToRoute('home');
						}
						
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
	professorescadeira: [],
	isCadeira: false,
	cursoid: null,
	cadeiraid: null,
	feupid: null,
	
	initialGiveFeedback: function(){
		this._super();
		
		var token = this.get('controllers.index').get('token');
		var usr = this.get('controllers.index').get('usr');
		var self = this;
		
		this.set('professorescadeira',[]);
		this.set('isCadeira',false);
		
		if(this.cadeiraid != "")
		{	
			var apigo = "/api/database/cadeira/docentes/";
			var codigocadeira = this.cadeiraid;
			this.set('isCadeira',true);
			
			$.post(apigo, {"idCadeira": codigocadeira}).then( function(response)
			{
				if(response.success)
				{   
					response.results.forEach(function(item){
						item.style = "background-image: url(" + item.img_url +"); background-size:cover; background-repeat:no-repeat;";
						self.professorescadeira.addObject(item);
					});
					
					console.log(self.professorescadeira);
				}
			});
		}
	},
	
	actions: {
       
        subfeedback: function() {
		
			var apigo = null;
			var type2 = "vazio";
			var type = "vazio";
			
			if(this.cursoid != "")
			{
				apigo = "/api/database/feedback/" + this.cursoid.toUpperCase();
				type2 = "insert";
				type = "curso";
			}
			else if(this.cadeiraid != "")
			{
				apigo = "/api/database/feedback/" + this.cadeiraid;
				type2 = "insert";
				type = "cadeira";
			}
			else if(this.feupid != "")
			{
				apigo = "/api/database/feedback/FEUP";
				type2 ="insert";
				type = "feup";
			}
			
			var self = this;
			var usr = this.get('controllers.index').get('usr'); //VAI BUSCAR O USERNAME SE FEZ LOGIN , SENAO DA UNDEFINED

			if(usr != null)
			{
				var titulo = document.getElementById("givefeedback_title").value;
				var texto = document.getElementById("givefeedback_description").value;

				var token = this.get('controllers.index').get('token');
							
				$.post(apigo, {"token": token, "texto" : texto, "type" : type, "userid" : usr, "tagnome": "", "type2": type2}).then( function(response)
				{
				
				  if (response.success)
				  {
						if(self.cursoid != "")
						{
							self.transitionToRoute('cursos',{queryParams: {codigo: self.cursoid}});
						}
						else if(self.cadeiraid != "")
						{
							self.transitionToRoute('cadeiras',{queryParams: {codigo: self.cadeiraid}});
						}
						else if(self.feupid != "")
						{
							self.transitionToRoute('home');
						}
				  }
				  else
						alert("Algo deu Errado a inserir feedback de " + type + ".");
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
			apigo = apigo + this.cadeiraid;
			type="cadeira";
		}
		else if(this.userid != "")
		{
			this.set('isUser',true);
			//TODO: MOSTRAR OS DO USER!
			type="user";
		}
			
		//GET FEEDBACKS
		var token = this.get('controllers.index').get('token');
		
		var usr = this.get('controllers.index').get('usr');
		var apigo2 = 'api/database/utilizador/';
		
		$.post(apigo2, {"token":token, "numero":usr}).then( function(response)
		{
			var nick = null;
			if (response.success)
			{
				nick = response.results[0].nickname;
			}
			else
			{
				alert("Algo deu Errado a ir buscar o nickname.");
			}
				
			$.post(apigo, {"token": token, "type" : type, "type2": "get"}).then( function(response) // SE FOR GET5 DEVOLVE 5 APENAS, SE FOR GET DEVOLVE TODOS.
			{
			  if (response.success)
			  {	
					var count = 0;
					response.results.forEach(function(item){
						if(item.nome == nick)
						{
							response.results[count].isMeu = true;
						}
						else
						{
							response.results[count].isMeu = false;
						}
						count = count +1;
					});
					self.set('feedbacks', response.results);
			  }
			  else
					alert("Algo deu Errado No Get Feedbacks.");
			});
			
		});

	},
	
	actions: {
       
        subfeedback: function() {
		
        },
		
		deletefeedback: function(id) {
		
			var self = this;
			var apigo = "/api/database/feedback/delete";
			var token = this.get('controllers.index').get('token');
			var usr = this.get('controllers.index').get('usr');
			
			$.post(apigo, {"token": token, "type" : "delete", "idFeedback": id, "NumeroUser": usr}).then( function(response) // SE FOR GET5 DEVOLVE 5 APENAS, SE FOR GET DEVOLVE TODOS.
			{
			  if (response.success)
			  {							
					location.reload(); 
			  }
			  else
					alert("Algo deu Errado No Delete Feedbacks.");
			});
			
        },
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
  
  actions: {
       
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
		var user_pct_Id;
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
								user_pct_Id = parserLogin(response.body);
								return user_pct_Id;
							}
							else
							{
								deferred.reject();
							}
							
						}).then(function(pct_id)
							{
								console.log("pct_id: "+user_pct_Id+" vs "+pct_id);
								var auxUrl = '/api/sigarra/getStudentId?pct_id=' + user_pct_Id;
								$.get(auxUrl).then(function(response)
								{
									if(response.statusCode = 200){
										console.log("Verify Response Body");
										console.log(response);
										//alert("my shit");
										//alert(parserNumUnico(response.body));
										userId = parserNumUnico(response.body);
										self.set('usr',userId);
										self.set('loginSuccess', "able");
										console.log("User identifier: "+ userId+"\n");
										datan = self.getProperties('username', 'password','loginSuccess');
										setTimeout(function(){ updateCourses(userId);},1000);
									}
									else
									{
										console.log(response.body);
										deferred.reject();
									}
								
								
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
  }
});


function updateCourses(userId){
	//$('#spinner #statusText').text("Getting your courses from sigarra (may take a while...)");
	var courses;
	setTimeout(function(){
	
	
		$.ajax({
			type: "GET",
			url: "/api/database/utilizador/exists/" + userId,
			success: function(data, textStatus, jqXHR)
			{
				//alert("entrou aqui");
				if (data.exists == true)
				{	
					// VER SE PRECISA DE UPDATE
					//alert("vai ver se precisa de atualizar");
					$.ajax({
						type:"GET",
						url: "/api/database/utilizador/needsUpdate/" + userId,
						success: function(data_2, textStatus, jqXHR)
						{
							if (data_2.result == true) // PRECISA DE UPDATE
							{
								alert("Vai atualizar dados");
								$.ajax({
									type: "GET",
									url: "/api/sigarra/getStudentCourses",
									data: "pv_codigo=" + userId,
									success: function(data_3, textStatus, jqXHR)
									{
										//var json = JSON.parse(data);
										console.log(data_3.body);
										if(data_3.statusCode == 200)
										{
											alert("recebeu resposta positiva");
											$.post('/api/database/utilizador/updateUser/', {"userId": userId, "courseData":data_3.body}).then(function(result)
											{
												console.log("fez post");
												if (result.success == false)
												{
													alert("erro a criar user");
												}
											});
										}
										else
										{
											alert("recebeu resposta negativa");
										}
									},
									error: function(data_3, textStatus, jqXHR)
									{
										alert("ERRO NO AJAX");
									}
								});
							}
							else	// NAO PRECISA DE UPDATE
							{
								// DO NOTHING
								//alert("Nao vai atualizar dados");
							}
						},
						error: function(data, textStatus, jqXHR)
						{
							alert("ERRO NO AJAX");
						}
					});
				}
				else
				{
					// INSERIR NOVO GAJO
					//alert("vai inserir novo user");
					$.ajax({
								type: "GET",
								url: "/api/sigarra/getStudentCourses",
								data: "pv_codigo=" + userId,
								success: function(data, textStatus, jqXHR)
								{
									//var json = JSON.parse(data);
									console.log(data.body);
									if(data.statusCode == 200)
									{
										alert("recebeu resposta positiva");
										$.post('/api/database/utilizador/insertNewUser/', {"userId": userId, "courseData":data.body}).then(function(result)
										{
											if (result.success == false)
											{
												alert("erro a criar user");
											}
										});
										
									}
									else
									{
										alert("recebeu resposta negativa");
									}
								},
								error: function(data, textStatus, jqXHR)
								{
									alert("ERRO NO AJAX");
								}
							});
				}
			},
			error: function(data, textStatus, jqXHR)
			{
				alert("Erro no UpdateCourses");
			}
		
		});
	},1000);	
}



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

function getCourses(userId){
	$('#spinner #statusText').text("Getting your courses from sigarra (may take a while...)");
	var courses;
	var data;
	
	if (userId > 0)

		data = "pv_codigo="+userId;
		
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
					alert("recebeu resposta positiva");
					//alert(data);
					return data;
					/*$('#spinner #statusText').text("Done! Here they are");
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
					console.log(vec);*/
				}
				else
				{
					alert("recebeu resposta negativa");
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
	var url = e1.querySelector('a').href; // POR VEZES ESTE VALOR VEM A NULL E FALHA
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