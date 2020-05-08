const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
let User = require("./models/user.model");

const BCRYPT_SALT_ROUNDS = 10;

require("dotenv").config();

const app = express();

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {credentials: true};
app.use(cors(corsOptions));

passport.use("register", new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
    session: false,
  },
  (username, password, done) => {
    try {
      User.findOne({username: username}).then(user => {
        if (user != null) {
          console.log("username already taken");
          return done(null, false, {message: "username already taken"});
        } else {
          bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(hashedPassword => {
            User.create({
              username: username,
              password: hashedPassword
            }).then(user => {
              console.log("user created");
              return done(null, user);
            });
          });
        }
      });
    } catch (err) {
      done(err);
    }
  }
))

passport.use("login", new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
    session: false,
  },
  (username, password, done) => {
    try {
      console.log("username in login strategy: " + username);
      User.findOne({username: username}).then(user => {
        if (user === null) {
          return done(null, false, {message: "username not found"});
        } else {
          console.log("about to compare: ");
          console.log(password);
          console.log(user);
          bcrypt.compare(password, user.password).then(response => {
            if (response !== true) {
              console.log("invalid password");
              return done(null, false, {message: "invalid password"});
            }
            console.log("user found & authenticated");
            return done(null, user);
          });
        }
      });
    } catch (err) {
      done(err);
    }
  },
));

passport.serializeUser(function(user, done) {
  console.log("serializing user");
  console.log("user.id is: " + user._id);
  console.log(user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log("deserializing user");
    done(err, user);
  });
});

// connect routers to app
const loginRouter = require("./routers/login");
const registerRouter = require("./routers/register");
const logoutRouter = require("./routers/logout");
const gameRouter = require("./routers/game");
const authenticateRouter = require("./routers/authenticate");
const userRouter = require("./routers/user");
const newRouter = require("./routers/new");
const moveRouter = require("./routers/move");
const completeRouter = require("./routers/complete");
const sseRouter = require("./routers/sse");
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/logout", logoutRouter);
app.use("/game", gameRouter);
app.use("/authenticate", authenticateRouter);
app.use("/user", userRouter);
app.use("/new", newRouter);
app.use("/move", moveRouter);
app.use("/complete", completeRouter);
app.use("/sse", sseRouter);
// app.use("/archive_authenticate", archive_authenticateRouter);
// app.use("/archive_game", archive_gameRouter);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Sever is running on port ${port}`);
});
