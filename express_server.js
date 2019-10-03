const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const {findUser, generateRandomString, validateEmptyInputs} = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ["thisissecretcodemydyslexiaisactingupbye"],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
 

// url database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID:'aj481W' },
  "9sm5xK": {longURL: 'http://www.google.com', userID: 'aj481W'}
};

// users database
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

//renders a page to create a new url, if user not logged in it redirects to login page
app.get("/urls/new", (req, res) => { 
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = {
    user: req.session.user_id,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

// mainpage that displays the urls a user creats
app.get("/urls", (req, res) => {
  
  
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//register page that allows people to register
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

//genrated short urls will be displayed here along with a delete and edit button
app.post("/urls", (req, res) => {
  let a = generateRandomString();
  urlDatabase[a] = {longURL:req.body.longURL,userID:req.session.user_id};
  req.session.user_id;
  res.redirect(`/urls/${a}`);

});

//login page that allows user to register 
app.get("/login",(req,res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };

  res.render("urls_login", templateVars);
});

//validating for users when they log in, and will redirect when username is undefined
app.post("/login", (req, res) => {
  
  const user = findUser(req.body.email, users);
  const errorMessage = validateEmptyInputs(req.body.email, req.body.password);
  console.log(errorMessage)
  if (errorMessage) {
    
    res.status(400).send(errorMessage,"error with logging in");
  }
 
  if (user === undefined) {
     res.redirect("/urls")
  }
  if (bcrypt.compareSync(req.body.password, user.password)) {

    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("wrong");
  }

  
    
});

//validation for users when they register
app.post("/register", (req ,res) => {
  
  if (req.body.email === "" || req.body.password === "") {
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

  req.session.user_id = userId;
  res.redirect("/urls");
});

//log out button that redirects to main page after loggin in
app.post("/logout",(req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//renders a page that shows the shorturl along with the longurl with the ability to redirect to the the website via the shorturl
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//redirects the user to the website the shortned
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//deletes a url 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//adds a change to url 
app.post("/urls/:shortURL/add", (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL:req.body.newURL,userID:req.session.user_id};

  res.redirect("/urls");
});

//the port the app uses to run
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

