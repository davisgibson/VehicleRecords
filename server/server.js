const express = require('express')
const app = express()
const port = 3000
app.set('view engine', 'pug');
app.set('views', '../views');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
app.use(express.static('../public'));

//initializing tables
db.serialize(function(){
    //car types table stores make and model
    db.run('CREATE TABLE carTypes(make text,model text)');
    db.run('INSERT into carTypes (make,model) values ("Ford", "Mustang")');
    db.run('INSERT into carTypes (make,model) values ("Chevy", "Silverado")');
    db.run('INSERT into carTypes (make,model) values ("Hyundai", "Elantra")');


    //colors table
    
    db.run('CREATE TABLE colors (color text)');
    db.run('INSERT INTO colors (color) values ("Blue")');
    db.run('INSERT INTO colors (color) values ("Red")');
    db.run('INSERT INTO colors (color) values ("Green")');
    

    //years table
    db.run('CREATE TABLE years (year number(4))');
    for(var x = 1970; x < 2020; x++){
        db.run('INSERT INTO years (year) values (' + x + ')');
    }


    //create cars table and populate it so we don't have to add one every time :)
    db.run('CREATE TABLE cars (name varChar(20),  make varChar(20),  model varChar(20), color varChar(20), year number(4), miles number(10), description varChar(300))  ');
    db.run('INSERT INTO cars (name,make,model,color,year,miles,description) VALUES ("Dave","Hyundai","Elantra","Grey",2012,3000,"new")');
    db.run('INSERT INTO cars (name,make,model,color,year,miles,description) VALUES ("John","Chevy","Silverado","Green",2013,3020,"used")');
});





app.listen(port, () => console.log(`app listening on port ${port}!`));




app.get('/cars', function (req, res) {
    var carList = [];
    db.all("SELECT name,make,model,color,year,miles,description FROM cars", function(err, rows) {
        rows.forEach(function(rows){
            carList.push(rows);
        });
        res.render('cars', {items: carList});
    });
});



app.get('/cars/add',function(req,res) {
    var types = new Array();
    var prom = new Promise(function(resolve,reject){
        db.all("SELECT make,model FROM carTypes", function(err,rows) {
            rows.forEach(function(rows){
                types.push(rows);
            });
            if(types.length > 0){
                resolve(types);
            }
            else{
                reject(new Error("OOPS"));
            }
        });
    }).then(function(value){
        res.render('addCar', {types: value});
    }).catch(function(err){
        console.log(err);
    });
});



/* USEFUL STUFF
app.get('/cars/:carID', function (req, res) {
    res.send(req.params);
});

app.get('/', function (req, res) {
    res.render('test', { title: 'Hey', message: 'Hello there!' });
});*/

