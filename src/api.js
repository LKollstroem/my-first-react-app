//Add modules, frameworks and libraries
const express = require("express");
const app = express();
var cors = require('cors');
var request = require ('request');
//BodyParser for form data module
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true}));
//require mongodb in use
const MongoClient = require("mongodb").MongoClient;
//use querystring and axios to be able to get token from Spotify
const querystring = require("node:querystring");
const axios = require("axios");
var cookieParser = require('cookie-parser');
//require env for use with password and username
require("dotenv").config();

//user id, password and token
var client_id = process.env.USERID;
var pwAtlas = process.env.PASSWORD
var client_secret = process.env.PASSWORD2
var redirect_uri = 'http://localhost:8081/callback';
var token;

//Generate random string containing numbers and letters on param and return
var generateRandomString = function(length) {
  var randomString = '';
  var alternatives = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    randomString += alternatives.charAt(Math.floor(Math.random() * alternatives.length));
  }
  return randomString;
};

//add login method with Express with redirect to callback
app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

//Ask for token and if not work go to callback page:
app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var token = body.access_token,
        refresh_token = body.refresh_token;
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + token },
          json: true
        };
// access Spotify Web API with help of token 
        request.get(options, function(error, response, body) {
          console.log(body);
        });
// pass token to browser to make requests from there and it also redirects to /
        res.redirect('/#' +
          querystring.stringify({
            token: token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

//Refresh token if it gets old
app.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var token = body.access_token;
      console.log(token);
      res.send({
        'access_token': token
      });
    }
  });
});
//Create routes for home page
//Lets get the firs API information from Spotify
app.get("/home", (req, res) => {
  var playlist = {
    url: 'https://api.spotify.com/v1/playlists',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(playlist, function(error, response, body) {
    console.log(body) 
    res.send('Home' + body);
  })
});

//
//Trying to connect to Mongo in Atlas
const uri = "mongodb+srv://leenakollstrom:" + pwAtlas + "@cluster0.0sdore5.mongodb.net/test";

//Make routes with mongo and first add some data, this did not work at all
//MongoClient.connect(uri, function(err, db) {
//  if (err) retur
//  var playlist = db.playlist('album')
//  playlist.insert({artist: 'Roxette', song: 'Love', album: 'Lovers', year:'2019' }, function(err, result) {
//    playlist.find({artist: 'Roxette'}).toArray(function(err, docs) {
//      console.log(docs[0])
//      db.close()
//    })
//  })
//})

//Then routes to get the data
app.get('/getall', function (req, res){
  console.log("Asking for all playlist albums from database");
 //connection object
  const client = new MongoClient(uri, {
      useNewUrlParser:true,
      useUnifiedTopology:true
  })
  console.log("start connection");
  async function printPlaylist(){
      try{
//Mongo connection query details
      await client.connect();
      const collection = client.db("playlist").collection("album");
//Make query
      var result = await collection
          .find() //all items
          .limit(10) // we want only 10
          .toArray()
      res.send(result);

      } catch(e){
          console.log(e);
      }finally {
          await client.close();
          console.log("Mongodb connecton has been closed")
      }

  }
//Not sure how to make this print with JSON as asked for.
  printPlaylist();
});

//Return one item with given id mongodb:
app.get("/:id", function(req, res){
  console.log("find album with id");
//connection object
  const client = new MongoClient(uri, {
  useNewUrlParser:true,
  useUnifiedTopology:true
  })
  console.log("start connection");
  async function printId(){
    try{
//Mongo connection query details
    await client.connect();
    const collection = client.db("album").collection("id");
//Make query
    var result = await collection
      .find() //all items
      .limit(10) // we want only 10
      .toArray()
    res.send(result);

    } catch(e){
      console.log(e);
    }finally {
      await client.close();
      console.log("Mongodb connecton has been closed")
    }
  }
//Not sure how to make this print with JSON as asked for.
printId();
});

//Add data
app.post("/add", function(req, res){
    res.send("Add Song: " + song + artist + album + "(" + year + ")");
});

//delete function not working yet
app.delete("/remove/:id", function(req,res){
  res.send("Remove album by " + req.params.id);
});  
//put function -- not working
app.put("/update/:id", function(req,res){
  res.send("Modify album by id " + req.params.id);
});  

//set web server to listen to port
var PORT = process.env.PORT || 8081;
app.listen(PORT, function(){
    console.log('App listening on port %d', PORT);
});
var http = require("http");
http.createServer(function (request, response) {
  if(request.url === "/"){
    response.writeHead(200,{'Content-Type':'text/plain'});
    var fs = require("fs");
        var data = fs.readFileSync('index.html');
        response.write(data.toString());
        response.end();
  }      
})        
app.get("/", (req, res) => {
  res.sendFile('index.html', {root: __dirname })
});