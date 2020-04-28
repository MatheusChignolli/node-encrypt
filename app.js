//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"]
})

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get("/", function(req, res) {
  res.render("home");
});

app.route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function(req, res) {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
      email: username
    }, function(err, result) {
      if(!err) {
        if(result) {
          console.log(result);
          if (result.password == password) {
            res.render("Secrets");
          } else {
            res.render("Home");
          }
        } else {
          res.render("Home");
        }
      } else {
        console.log(err);
      }
    });

  });

app.route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {

    const email = req.body.username;
    const password = req.body.password;
    
    const newUser = new User({
      email: email,
      password: password
    });
          console.log(req.body);

    newUser.save(function(err) {
      if(!err) {
        console.log("User created.")
        res.render("Secrets");
      } else {
        console.log(err);
      }
    });

  });








app.listen(3000, function() {
  console.log("Server ON.");
});