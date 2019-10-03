const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(cookieParser());

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
}

 
const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const findUser = function(email) {
  for( let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
}

const validateInput = function(email, password) {
  if (email === "" || password === ""){
    return "error email or password cant be empty"
  }
}
// app.get("/", (req, res) => {
//   res.send("hello");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body> Hello World </b></body></html>\n");
// });

app.get("/urls/new", (req, res) => { // first
  if(!req.cookies.user_id) {
    res.redirect("/login")
  }
  let templateVars = {
    user: req.cookies.user_id,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  
  
  let templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  console.log(urlDatabase)
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars)
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  let a = generateRandomString();
  urlDatabase[a] = {longURL:req.body.longURL,userID:req.cookies.user_id};
  req.cookies.user_id
  res.redirect(`/urls/${a}`);

});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/login",(req,res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };

  res.render("urls_login", templateVars)
});


app.post("/login", (req, res) => {
  
  const user = findUser(req.body.email);
  const errorMessage = validateInput(req.body.email, req.body.password)

  if (errorMessage){
    
    return res.status(400).send(errorMessage)
 }

    if (user && user.password ===  req.body.password) {
      // console.log(userId)
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
    
});

app.post("/register", (req ,res) => {
  
  if (req.body.email === "" || req.body.password === ""){
    console.log("error email or password cant be empty")
    return res.status(400).send("email or password cannot be empty")
 }

  for (let emails in users) {
    if (users[emails].email === req.body.email) {
      return res.status(400).send("email aready exists")
    }
  }
  
  let userId=  generateRandomString();

  users[userId] = {
    id : userId,
    email: req.body.email,
    password: req.body.password
  };

  console.log(users)
  res.cookie("user_id", userId);
  res.redirect("/urls");
})

app.post("/logout",(req, res) => {
  res.clearCookie("user_id", req.body.email);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[req.params.shortURL] = {longURL:req.body.newURL,userID:req.cookies.user_id};
  // console.log(req.cookies.user_id, "1212112")

  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

