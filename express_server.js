const express =  require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(length) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result;
}

generateRandomString(6)

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
}); 

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK")
});

app.get("/urls.json",(req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL,longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body> Hello World </b></body></html>\n")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

