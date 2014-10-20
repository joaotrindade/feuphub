App = Ember.Application.create();

App.Router.map(function() {
  this.route("credentials");
});

App.LoginFormView = Ember.View.extend({
    tagName: 'form',
    username: null,
    password: null,

    submit: function(event) {
		event.preventDefault();
		
		$('#spinner').fadeIn(100);
		$('#spinner #statusText').text("Validating your login with SIFEUP");
		
		var username = this.get('username');
		var password = this.get('password');
			
		setTimeout(function(){

			$.ajax({
				type: "POST",
				url: "api/login",
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
						setTimeout(function(){getCourses(username);},1000);
					}
					else{
						$('#spinner #statusText').text("incorrect sifeup login credentials");
						setTimeout(function(){$('#spinner').stop().fadeOut(500);},1000);
					}
				}
			});
		}, 1000);
    },
});

function getCourses(username){
	$('#spinner #statusText').text("Getting your courses from sigarra (may take a while...)");
	var courses;

	setTimeout(function(){

		$.ajax({
			type: "GET",
			url: "/api/getCourses",
			data: "pv_login="+username,
			success: function(data, textStatus, jqXHR)
			{
				//var json = JSON.parse(data);
				
				if(data.statusCode == 200)
				{
					$('#spinner #statusText').text("Done! Here they are");
					courses=data.body;
					console.log(courses);
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
		url: "api/logout",
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
