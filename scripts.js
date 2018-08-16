
var numberOfConfig = 0;

/************************Funções que trabalham mudando o proprio HTML *************************************************************************************************** */
function Clean() {
  $("#unidade").val("");
  $("#classes").html("");
  numberOfConfig = 0;
}

function  CreateEmptyColumn () {

  var i = numberOfConfig++;
  var str =
        "<p class='form-group col-xs-2'>" +
        "<label for='classe" + i + "'> Classe:  </label>" +
        "<input  id='classe" + i + "'  type='text' class='form-control ' placeholder=''>" +
        "<label for='vinculo" + i + "'> Vinculo:  </label>" +
        "<input  id='vinculo" + i + "' type='text' class='form-control ' placeholder=''>" +
        "<label for='min" + i + "'> Area minima:  </label>" +
        "<input  id='min" + i + "' type='text' class='form-control ' placeholder=''>" +
        "<label for='max" + i + "'> Area maxima:  </label>" +
        "<input  id='max" + i + "' type='text' class='form-control ' placeholder=''>" +
        "</p>";
       $("#classes").append(str);
}

function CreateFilledColumn (json) {

    var len = json.item.length;
    var items = json['item'] ;
    $("#classes").html("");
    $("#unidade").val(json['unidade']);

    for (var i = 0; i < len; i++ ) {
        console.log(i);
        var array = items[i];
        var str =
        "<p class='form-group col-xs-2'>" +
        "<label for='classe" + i + "'> Classe:  </label>" +
        "<input  id='classe" + i + "'  type='text' class='form-control ' placeholder='' value='" + array['classe'] + "'>" +
        "<label for='vinculo" + i + "'> Vinculo:  </label>" +
        "<input  id='vinculo" + i + "' type='text' class='form-control ' placeholder='' value='" + array['vinculo'] + "'>"  +
        "<label for='min" + i + "'> Area minima:  </label>" +
        "<input  id='min" + i + "' type='text' class='form-control ' placeholder='' value='" + array['min'] + "'>"  +
        "<label for='max" + i + "'> Area maxima:  </label>" +
        "<input  id='max" + i + "' type='text' class='form-control ' placeholder='' value='" + array['max'] + "'>" +
        "</p>";
        $("#classes").append(str);
    }
}
  
function loadId (str) {
	$("#idC").val(str.toString());	
	LoadFromDb();
}
function createDropDown (lst) {
	//$("#dropdown").html("");
	console.log("HTML LIMPO");
  var str = 
  "<input type='button' class='btn btn-default dropdown-toggle' role='button' id='dropdownMenu' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' >" +
    "<span class='caret'></span></input>" + 
   "<ul class='dropdown-menu dropdown-menu-right' role='menu' aria-labelledby='dropdownMenuLink'>";

  var buttonTemplate = "";
	for (var i in lst) {
		buttonTemplate += "<li role='presentation'> <a role='menuitem' onclick=\"loadId(\'"+ lst[i].id + "\')\">" + lst[i].id + "</a></li>";
	}		
  str += buttonTemplate;
  str += "</ul>";	
  $("#dropdown").append(str);
	console.log(buttonTemplate);
}

/****************************************************************************************************************************************/
/******************************* Banco de dados e logica do programa**********************************************************/

function SaveInDb () {

    var column_number = numberOfConfig;  
    var id = $("#idC").val();
    var unidade = $("#unidade").val();
    var item = [];
    var jsonAux = {};
    var counter = 0;
    var classe ;

    for (var i = 0; i < column_number; i++) {
        classe = $("#classe" + i).val();
        console.log("CLasse: " + classe);  
        if (classe != "") {
          jsonAux['classe'] = $("#classe" + i).val();
          jsonAux['vinculo'] = $("#vinculo" + i).val();
          jsonAux['min'] = $("#min" + i).val();
          jsonAux['max'] = $("#max" + i).val();
          item.push(jsonAux);
          counter++;
        }
        else {
          console.log("Skipping value");
        }
          jsonAux = {};
      }
    
    var json = {
        '_id': id,
        'unidade': unidade,
        'item' : item,
      }

    if (id === "") {
      $("#saveLabel").text("É necessario entrar com uma configuração para salvar");
    }
    else if (counter > 0)  {
    db.get(id).then(function(doc){
          json._rev = doc._rev;
          db.put(json);
          $("#saveLabel").text(id +" atualizado com sucesso");
		
		  
      }).catch(function (err) {
        if (err.name === 'not_found') {
          db.put(json);
		  $("#saveLabel").text(id + " criado com sucesso");
          listDb();
		  console.log("List DB");
		  
        }
      })
    }else {
      $("#saveLabel").text("É necessario pelo menos uma classe para salvar");
    }
    return json;
}

function updateDb(object) {
    db.get(object._id).then(function (doc) {
          console.log(doc);
      });
}

function deleteId() {

    var id = $("#idC").val();
    db.get(id).then(function (doc,err) {
        if(err) {
          $("#saveLabel").text("O valor encontrado nao foi encontrado, nao foi possivel deletar");
        }else {
            $("#saveLabel").text(id + " apagado com sucesso");
            Clean();
            return db.remove(doc);
        }
    }).then(function () { 
		listDb();
	});
  }

function LoadFromDb() {
    var id = $("#idC").val ();
    db.get(id).then(function(doc) {
        var json = doc;
        numberOfConfig = json.item.length;
        $("#saveLabel").text("");
        CreateFilledColumn(json);
    });
}

function listDb() {
	db.allDocs({include_docs:false}
	).then(function (result) {
		createDropDown(result.rows);
	});
}
