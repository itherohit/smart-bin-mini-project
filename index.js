const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const smartbins = require("./model");

const router = express.Router();

const app = express();

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


const loginAuth = (req,res,next) => {
  const cookies = req.cookies;
  if(cookies.loggedIn == 'true'){
    next();
  }else{
    return res.redirect("/login");
  }
};


const port = process.env.PORT || 4000;

var uri = "mongodb+srv://itherohit:admin@cluster0.hfpba.mongodb.net/SmartBin?retryWrites=true&w=majority";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

app.get("/",loginAuth, async function(req,res){
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'unsafe-inline' 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );

  var datapoints = {
    'center': [79.0184, 10.7285],
    'zoom': 1,
    'type': 'FeatureCollection',
    'features': []
  };

  const data = await smartbins.find();

  for(let i=0; i< data.length; i++){
    var geo = {
      'type': 'Feature',
      'geometry': {
          'type': 'Point',
          'coordinates': [data[i].lon,data[i].lat]
      },
      'properties': {
          'description': "<div>" + data[i].name +"</div>"
      }
    }
    datapoints.features.push(geo);
  }
  res.render("index", {data: data, datapoints: JSON.stringify(datapoints)});
})

app.get("/filled",loginAuth, async function(req,res){
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'unsafe-inline' 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  var datapoints = {
    'center': [79.0184, 10.7285],
    'zoom': 1,
    'type': 'FeatureCollection',
    'features': []
  };

  const data = await smartbins.find().where({ isFull: true});
  for(let i=0; i< data.length; i++){
    var geo = {
      'type': 'Feature',
      'geometry': {
          'type': 'Point',
          'coordinates': [data[i].lon,data[i].lat]
      },
      'properties': {
          'description': "<div>" + data[i].name +"</div>"
      }
    }
    datapoints.features.push(geo);
  }
  res.render("filled", {data: data, datapoints: JSON.stringify(datapoints)});
})

app.get("/login", function(req,res){
  res.render("Login");
})

app.post("/login", function(req,res){
  var data = req.body;
  if(data.name == "admin" && data.password == "admin"){
    res.cookie('loggedIn',true);
    res.redirect("/");
  }
  res.send("Error");
})

app.get("/logout", function(req,res){
  res.cookie('loggedIn',false);
  res.redirect("/login");
})


app.get("/new",loginAuth, function(req,res){
    res.render("new");
})

app.post("/new",loginAuth, function(req,res){
    var data = req.body;
    data.isFull = false;
    smartbins.insertMany(data, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.redirect("/");
        }
      });
});

app.get("/delete/:id",loginAuth, function(req,res){
  const id = req.params.id;
  smartbins.deleteOne({ _id: id }, function (err) {
    if (err){
      res.send("Error");
    }
  });
  res.redirect("/");
})

app.get("/reset/:id",loginAuth, async function(req,res){
  const id = req.params.id;
  let data = await smartbins.findOne({ _id: id});
  data.isFull = false;
  await data.save();
  res.redirect("/");
})

app.get("/view/:id",loginAuth, async function(req,res){
  const id = req.params.id;
  let data = await smartbins.findOne({ _id: id});
  res.render("view", {data: data});
})

app.listen(port, function() {
  console.log("Server is running on Port: " + port);
});