const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

//Function to generate a random 6 character string for URL
function generateRandomString() {
  let randomString = "";
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString
}

//Placeholder Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


//Prints comfirmation in the terminal that the server is up and listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
//Create
//

//Generates a random string when a url is submitted in /urls/new, saves it to the database
//then redirects to the page displaying that specific pair of short/long URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//
//Read
//

//Current homepage. To be fixed I assume
app.get("/", (req, res) => {
  res.send('Hello!');
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

//Redirects from shortened URL to longURL
app.get("/u/:id", (req, res) => {
  id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//
//Update
//

//Edits the longURL in the database
app.post('/urls/:id', (req, res) => {
urlDatabase[req.params.id] = req.body["longURL"]
  res.redirect('/urls');
});

//
//Delete
//

//Deletes the selected entry from the database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});