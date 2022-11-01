const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//Placeholder Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send('Hello!');
});

//Prints comfirmation in the terminal that the server is up and listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Page that lists all URLs and their shortened forms
app.get("/urls", (req, res) => {
const templateVars = { urls: urlDatabase };
res.render("urls_index", templateVars);
});

//Page to add new URLs to "database"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Page that shows a specific URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

