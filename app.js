//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// Hash and Encrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;
// Session
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// Google Login
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Find OrCreate create a function to find or create a user in database from external auths
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

// App use session
app.use(session({
  secret: "This is a little little secret.",
  resave: false,
  saveUninitialized: false
}));

// Initialize passport package
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// Serialize and Deserialize Sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(acceswsToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function(err, user) {
    return cb(err, user);
  });
}));

app.get("/", function(req, res) {
  res.render("home");
});

// 
// 
// Register user with encryptation 
// 
// 


// app.route("/login")
//   .get(function (req, res) {
//     res.render("login");
//   })
//   .post(function(req, res) {

//     const username = req.body.username;
//     const password = req.body.password;

//     User.findOne({
//       email: username
//     }, function(err, result) {
//       if(!err) {
//         if(result) {
//           bcrypt.compare(password, result.password, function (err, hash) {
//             if (hash === true) {
//               res.render("Secrets");
//             } else {
//               res.render("Home");
//             }
//           });
//         } else {
//           res.render("Home");
//         }
//       } else {
//         console.log(err);
//       }
//     });

//   });

// app.route("/register")
//   .get(function (req, res) {
//     res.render("register");
//   })
//   .post(function (req, res) {

//     const email = req.body.username;
//     const password = req.body.password;

//     bcrypt.hash(password, saltRounds, function(err, hash) {
//       const newUser = new User({
//         email: email,
//         password: hash
//       });

//       newUser.save(function (err) {
//         if (!err) {
//           console.log("User created.")
//           res.render("Secrets");
//         } else {
//           console.log(err);
//         }
//       });
//     });

//   });

// 
// 
// Register user with sessions and another stuff 
// 
// 

app.route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {

    const username = req.body.username;
    const password = req.body.password;

    const user = new User ({
      username: username,
      password: password
    });

    req.login(user, function(err) {
      if(err) {
        console.log(err);
      } else {
        // Authenticate User
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    })

  });

app.route("/secrets")
  .get(function(req, res) {
    if(req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });

app.route("/logout")
  .get(function(req, res) {
    req.logout();
    res.redirect("/");
  });

app.route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {

    const email = req.body.username;
    const password = req.body.password;

    User.register({
      username: email
    }, 
    password, function(err, user) {
      if(err) {
        console.log(err);
        res.redirect("/resecretsgister");
      } else {
        // Authenticate User
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
        });
      }
    });

  });






app.listen(3000, function() {
  console.log("Server ON.");
});