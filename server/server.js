/*
    Hey Caprock Custom Applications! Thank you guys so much for giving me the opportunity to be a part of your team!
    
    Now I know this file is a bit scattered... I could definitely spend another week getting rid of redundancy and actually 
    using post/put requests instead of only using get. I know that's not the best way, but hey, it works.

    To edit a car, click on it. If you're not signed in it will redirect you to the sign in page. If you don't have an account,
    don't worry! You can sign up. All of the users are stored in a database, and all of the tables are stored in memory.

*/

//initializing the libraries used for this!
const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'pug');
app.set('views', '../views');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
app.use(express.static('../public'));
const session = require('express-session');
var sess = {
    isLoggedIn: false,
    secret: 'Secret, no looking!',
    cookie: {},
    sameSite: true,
    saveUninitialized: false,
    resave: false
}

app.use(session(sess));


//initializing tables
db.serialize(function(){
    //car types table stores make and model
    db.run('CREATE TABLE carTypes(make text,model text)');
    db.run('INSERT into carTypes (make,model) values ("Ford", "Mustang")');
    db.run('INSERT into carTypes (make,model) values ("Ford", "Fusion")');
    db.run('INSERT into carTypes (make,model) values ("Chevy", "Silverado")');
    db.run('INSERT into carTypes (make,model) values ("Chevy", "Camero")');
    db.run('INSERT into carTypes (make,model) values ("Hyundai", "Elantra")');
    db.run('INSERT into carTypes (make,model) values ("Hyundai", "Sonata")');


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

    //users table
    db.run('CREATE TABLE users (username text, password text)');
    db.run('INSERT INTO users (username,password) values ("user", "pass")');


    //create cars table and populate it
    db.run('CREATE TABLE cars (name varChar(20),  make varChar(20),  model varChar(20), color varChar(20), year number(4), miles number(10), description varChar(300))  ');
    db.run('INSERT INTO cars (name,make,model,color,year,miles,description) VALUES ("Dave","Hyundai","Elantra","Grey",2012,3000,"new")');
    db.run('INSERT INTO cars (name,make,model,color,year,miles,description) VALUES ("John","Chevy","Silverado","Green",2013,3020,"used")');
});





app.listen(port, () => console.log(`app listening on port ${port}!`));

//function to redirect users if they aren't logged in.
const redirectLogin = (req,res,next) => {
    if(!req.session.isLoggedIn){
        res.redirect('/signin');
    }
    else{
        next();
    }
}


//gets the car page and sends it all of the cars in the DB
app.get('/cars', function (req, res) {
    var carList = [];

    db.all("SELECT name,make,model,color,year,miles,description FROM cars", function(err, rows) {
        rows.forEach(function(rows){
            carList.push(rows);
        });
        res.render('cars', {items: carList});
    });
});
//returns the makes and models from the carTypes table
app.get('/getCarTypes',function(req,res) {
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
        res.send(types);
    }).catch(function(err){
        console.log(err);
    });
});
//gets all of the colors from the DB
app.get('/getColors',function(req,res) {
    var colors = new Array();
    var prom = new Promise(function(resolve,reject){
        db.all("SELECT color FROM colors", function(err,rows) {
            rows.forEach(function(rows){
                colors.push(rows);
            });
            if(colors.length > 0){
                resolve(colors);
            }
            else{
                reject(new Error("OOPS"));
            }
        });
    }).then(function(value){
        res.send(colors);
    }).catch(function(err){
        console.log(err);
    });
});
//gets all of the years from the DB
app.get('/years',function(req,res) {
    var years = new Array();
    var prom = new Promise(function(resolve,reject){
        db.all("SELECT year FROM years", function(err,rows) {
            rows.forEach(function(row){
                years.push(row);
            });
            if(years.length > 0){
                resolve(years);
            }
            else{
                reject(new Error("OOPS"));
            }
        });
    }).then(function(value){
        res.send(years);
    }).catch(function(err){
        console.log(err);
    });
});
//gets all of the makes and models from the database (redundant, I know)
app.get('/cars/add', redirectLogin, function(req,res) {
    var types = new Array();
    var prom = new Promise(function(resolve,reject){
        db.all("SELECT make FROM carTypes GROUP BY make", function(err,rows) {
            rows.forEach(function(row){
                types.push(row);
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
//actually inserts the car to add into the database (should use a post request)
app.get('/pushCar',function(req,res){
    var carList = [];
    var prom = new Promise(function(resolve,reject){
        db.run('INSERT INTO cars (name,make,model,color,year,miles,description) VALUES ("' + req.query.name + '","' + req.query.make+'","'+req.query.model+'","'+req.query.color+'","'+req.query.year+'","' + req.query.miles+'","'+req.query.description+'")', function(err,rows) {
        });
        resolve();
    }).then(function(){
        db.all("SELECT name,make,model,color,year,miles,description FROM cars", function(err, rows) {
            rows.forEach(function(rows){
                carList.push(rows);
            });
            res.redirect('/cars');
        });
    }).catch(function(err){
        console.log(err);
    });
});
//gets all of the information from the specific car the user clicked. Finds the car by its name, which you cannot edit. If two names are the same, well...
app.get('/cars/edit', redirectLogin, function(req,res){
    var query = req.query;
    var car = {
        name: query.name,
        make: query.make,
        model: query.model,
        color: query.color,
        year: query.year,
        miles: query.miles,
        description: query.description
    }
    res.render('editCar',{info: car})
});
//actually edits the car (should be a put request)
app.get('/editCar',function(req,res){
    var prom = new Promise(function(resolve,reject){
        db.run('UPDATE cars SET make = "'+req.query.make+'", model= "'+req.query.model+'", color = "'+req.query.color+'", year = '+req.query.year+', miles = '+req.query.miles+', description = "'+req.query.description+'" WHERE name = "' + req.query.name+'"', function(err,rows) {
        });
        resolve();
    }).then(function(){
        var carList = [];
        db.all("SELECT name,make,model,color,year,miles,description FROM cars", function(err, rows) {
            rows.forEach(function(rows){
                carList.push(rows);
            });
            res.render('cars', {items: carList});
        });
    }).catch(function(err){
        console.log(err);
    });
});

app.get('/signin',function(req,res){
    res.render('signin');
});

app.get('/signup',function(req,res){
    res.render('signup');
});
//checks if the credentials are correct, and if not, redirects to the sign up page
app.get('/sign',function(req,res){
    var prom = new Promise(function(resolve,reject){
        var foundUser;
        db.all('SELECT * FROM users', function(err,users) {
            users.forEach(function(user){
                if(user.username == req.query.username && user.password == req.query.password){
                    foundUser = true;
                    console.log("found");
                }
            });
            if(foundUser){
                resolve();
            }
            else{
                reject();
            }
        });

    }).then(function(){
        req.session.isLoggedIn = true;
        res.redirect('/cars');
    }).catch(function(){
        console.log("user not found!");
        res.redirect('/signup');
    });
});
//actually signs the user up
app.get('/signu', function(req,res){
    var prom = new Promise(function(resolve,reject){
        db.run('INSERT INTO users (username,password) values ("' + req.query.username+ '", "'+ req.query.password +'")');
        resolve();
    }).then(function(){
        req.session.isLoggedIn = true;
        res.redirect('/cars');
    });
});

app.get('/deleteCar', function(req,res){
    var carList = new Array();
    var prom = new Promise(function(resolve,reject){
        db.run('DELETE FROM cars WHERE name = "'+req.query.name+'"');
        resolve();
    }).then(function(){
        db.all("SELECT name,make,model,color,year,miles,description FROM cars", function(err, rows) {
            rows.forEach(function(rows){
                carList.push(rows);
            });
            res.render('cars', {items: carList});
        });
    });
});
