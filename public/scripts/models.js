var carTypes;

function httpGet(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

window.onload = function(){
    carTypes = JSON.parse(httpGet('/getCarTypes'));
    console.log(carTypes);
}
    



var makeSelection = document.getElementById("make");
var modelSelection = document.getElementById('model');
makeSelection.addEventListener("change", function() {
    while(modelSelection.hasChildNodes()){
        modelSelection.removeChild(modelSelection.childNodes[0]);
    }
    console.log("huh?");
    console.log(makeSelection.value);
    carTypes.forEach(function(item){
        if(item.make == makeSelection.value){
            console.log(item.model);
            var n = document.createElement("OPTION");
            n.innerHTML = item.model;
            document.getElementById("model").appendChild(n);
        }
    });
});



