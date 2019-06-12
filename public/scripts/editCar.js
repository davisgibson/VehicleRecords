function getEditCar(name,make,model,color,year,miles,description){
    var thisCar = {
        Name: name,
        Make: make,
        Model: model,
        Color: color,
        Year: year,
        Miles: miles,
        Description: description
    };
    window.location.replace("/cars/edit?name="+thisCar.Name+"&make="+thisCar.Make+"&model="+thisCar.Model+"&color="+thisCar.Color+"&year="+thisCar.Year+"&miles="+thisCar.Miles+"&description="+thisCar.Description);
    
}

var carTypes;
var colors;
var years;
function httpGet(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
window.onload = function(){
    //get car types
    var prom = new Promise(function(resolve,reject){
        carTypes = JSON.parse(httpGet('/getCarTypes'));
        resolve(carTypes);
    }).then(function(cars){
        var carsAdding = new Array();
        cars.forEach(function(car){
            if(carsAdding.length == 0 || !carsAdding.includes(car.make)){
                carsAdding.push(car.make);
                var n = document.createElement("OPTION");
                n.innerHTML = car.make;
                document.getElementById("make").appendChild(n);
            }
        });
    }).catch(function(err){
        console.log(err);
    });

    //get colors
    var prom = new Promise(function(resolve,reject){
        colors = JSON.parse(httpGet('/getColors'));
        resolve(colors);
    }).then(function(value){
        colors.forEach(function(color){
            var n = document.createElement("OPTION");
            n.innerHTML = color.color;
            document.getElementById("color").appendChild(n);
        })
    }).catch(function(err){
        console.log(err);
    });

    //get years
    var prom2 = new Promise(function(resolve,reject){
        years = JSON.parse(httpGet('/years'));
        resolve(years);
    }).then(function(value){
        years.forEach(function(item){
            var n = document.createElement("OPTION");
            n.innerHTML = item.year;
            document.getElementById("year").appendChild(n);
        })
    }).catch(function(err){
        console.log(err);
    });
}
    
var colorSelection = document.getElementById("color");
var makeSelection = document.getElementById("make");
var modelSelection = document.getElementById('model');
makeSelection.addEventListener("change", function() {
    while(modelSelection.hasChildNodes()){
        modelSelection.removeChild(modelSelection.childNodes[0]);
    }
    carTypes.forEach(function(item){
        if(item.make == makeSelection.value){
            console.log("huh");
            var n = document.createElement("OPTION");
            n.innerHTML = item.model;
            document.getElementById("model").appendChild(n);
        }
    });
});



