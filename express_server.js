const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const {findUser, generateRandomString, validateInput} = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ["thisissecretcodemydyslexiaisactingupbye"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:'aj481W' },
  "9sm5xK": {longURL: 'http://www.google.com', userID: 'aj481W'}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls/new", (req, res) => { // first
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    user: req.session.user_id,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  
  
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  let a = generateRandomString();
  urlDatabase[a] = {longURL:req.body.longURL,userID:req.session.user_id};
  req.session.user_id;
  res.redirect(`/urls/${a}`);

});

app.get("/login",(req,res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };

  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  
  const user = findUser(req.body.email, users);
  const errorMessage = validateInput(req.body.email, req.body.password);
  console.log(user, req.body.password);
  if (errorMessage) {
    
    return res.status(400).send(errorMessage,"error with logging in");
  }
    
  // if (user && user.password ===  req.body.password) {
  if (bcrypt.compareSync(req.body.password, user.password)) {
    // console.log(userId)
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
    
});

app.post("/register", (req ,res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    console.log("error email or password cant be empty");
    return res.status(400).send("email or password cannot be empty");
  }

  for (let emails in users) {
    if (users[emails].email === req.body.email) {
      return res.status(400).send("email aready exists");
    }
  }
  
  let userId =  generateRandomString();

  users[userId] = {
    id : userId,
    email: req.body.email,
    password:  bcrypt.hashSync(req.body.password, 10)
  };

  console.log(users);
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/logout",(req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(urlDatabase)
  // console.log(req.params.shortURL) tried debugging with console log
  // console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/add", (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL:req.body.newURL,userID:req.session.user_id};
  // console.log(req.cookies.user_id, "1212112")

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

