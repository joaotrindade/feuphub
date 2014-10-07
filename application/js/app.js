App = Ember.Application.create();

App.Router.map(function() {
  this.route("credentials");
});


App.loginController = Ember.Object.create({
    login: function(username, password) {
      // $.ajax stuff goes here
    }
});

App.IndexController = Ember.Controller.extend({
	loginfederado: function(){alert("oi gostoso")}
});

App.LoginFormView = Ember.View.extend({
    tagName: 'form',
    username: null,
    password: null,

    submit: function(event) {
        event.preventDefault();

        var username = this.get('username');
        var password = this.get('password');

		$.ajax({
			type: "POST",
			url: "api/login",
			data: {'username':username,'password':password},
			async: false,
			success: function(data, textStatus, jqXHR)
			{
				if(data.headers["set-cookie"] !== undefined && data.headers["set-cookie"].length >1)
				{
					//set sigarra cookies
					document.cookie=data.headers["set-cookie"][0];
					document.cookie=data.headers["set-cookie"][1];
					$.ajax({
						type: "GET",
						url: "api/initialWebPage",
						async: false,
						success: function(data, textStatus, jqXHR)
						{
							document.cookie=data.headers["set-cookie"][0];
							var num = parserLogin(data.body);
							$.ajax({
								type: "GET",
								url: "/api/getPvNumUnico",
								//sigarra.up.pt/feup/pt/vld_entidades_geral.entidade_pagina?pct_id=777369 //
								data: "pct_id="+num,
								async: false,
								success: function(data, textStatus, jqXHR)
								{
									var numProfile = parserNumUnico(data.body);
									$.ajax({
										type: "GET",
										url: "/api/getStudentPage",
										data: "pv_num_unico="+numProfile,
										async: false,
										success: function(data, textStatus, jqXHR)
										{
											var pv_fest_id = parserPVFEST(data.body);
											$.ajax({
												type: "GET",
												url: "/api/studentCourses",
												data: "pv_fest_id="+pv_fest_id,
												async: false,
												success: function(data, textStatus, jqXHR){
													console.log(data);
												},
												error: function(XMLHttpRequest, textStatus, errorThrown) {
													alert("some error");
												}
											});
										},
										error: function(XMLHttpRequest, textStatus, errorThrown) {
											alert("some error");
										}
									});
								},
								error: function(XMLHttpRequest, textStatus, errorThrown) {
									alert("some error");
								}
							});
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							alert("some error");
						}
					});	
				}
				else{
					alert("incorrect sifeup login credentials");
				}
			},complete: function(){
				$.ajax({
					type: "POST",
					url: "api/logout",
					async: false,
					success: function(data, textStatus, jqXHR)
					{}
				});
				clearCookies();
			}
		});
    },
});

function clearCookies(){
	if(document.cookie.indexOf("HTTP_SESSION") >= 0){
		document.cookie = "HTTP_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	if(document.cookie.indexOf("SI_SESSION") >= 0){
		document.cookie = "SI_SESSION" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
	if(document.cookie.indexOf("SI_SECURITY") >= 0){
		document.cookie = "SI_SECURITY" + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
