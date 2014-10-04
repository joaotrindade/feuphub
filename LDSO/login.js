function validar()
      {
        if(document.getElementById('textfield').value == '')
        {
          document.getElementById('textfield').value = "Username...";
        }
        else
        {
          if(document.getElementById('textfield').value != 'Username...')
          {
            document.getElementById('textfield').value = document.getElementById('textfield').value;
          }
        }
      }
      function validar2()
      {
        if(document.getElementById('textfield2').value == '')
        {
          document.getElementById('textfield2').value = "Password";
        }
        else
        {
          if(document.getElementById('textfield2').value != 'Password')
          {
            document.getElementById('textfield2').value = document.getElementById('textfield2').value;
          }
        }
      }
	  function validar3() {
		if(document.getElementById('textfield').value == "Username...")
        {
          alert("Preencha os campos correctamente");
        }
        else
        {
          if(document.getElementById('textfield2').value == 'Password')
          {
            alert("Preencha os campos correctamente");
          }
		  else{
			//alert("data: "+document.getElementById('textfield').value + " " +document.getElementById('textfield2').value);
		  }
        }
	  }
	  
function handleClick(){
	alert("dasdsa");
	var xmlhttp;
var params = "p_app=160&p_amo=1264&p_user=ei11061&p_pass=mondraker7728feup";
xmlhttp=new XMLHttpRequest();
xmlhttp.open("POST","https://sigarra.up.pt/feup/pt/vld_validacao.validacao",true);
xmlhttp.send(params);
console.log(xmlhttp);
	
}