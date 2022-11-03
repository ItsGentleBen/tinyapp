const express = require("express");
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//
//Middleware
//
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(morgan('dev'));

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

//function to check is an email is already registered
const getUserByEmail = (userEmail) => {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  } return null;
};

//Placeholder Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "alesha",
    email: "a@b.ca",
    password: "123",
  },
  user2RandomID: {
    id: "chip",
    email: "1@2.ca",
    password: "abc",
  },
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
  return res.redirect(`/urls/${shortURL}`);
});


//logs in user when submitted 
app.post('/login', (req, res) => {
  const loginEmail = req.body.email
  const loginPassword = req.body.password
  const user = getUserByEmail(loginEmail)
  if (!user || user.password !== loginPassword) {
    res.status(403);
    return res.send('Email or Password is incorrect.')
  } 
  res.cookie('user_id', user.id)
  return res.redirect('/urls');
  });

//Logs out current user
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  return res.redirect('/login');
  });



//
//Read
//

//Directs to registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  return res.render("register", templateVars);
  });

  //Directs to login page
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  return res.render("login", templateVars);
  });



//Current homepage. To be fixed I assume
app.get("/", (req, res) => {
  res.send('Hello!');
});

//Page that lists all URLs and their shortened forms
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  return res.render("urls_index", templateVars);
  });

  //Page to add new URLs to "database"
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users, 
    user: users[req.cookies.user_id]
  };
  return res.render("urls_new", templateVars);
});

//Page that shows a specific URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id]
  };
  return res.render("urls_show", templateVars);
});

//Redirects from shortened URL to longURL
app.get("/u/:id", (req, res) => {
  id = req.params.id;
  const longURL = urlDatabase[id];
  return res.redirect(longURL);
});

//
//Update
//

//Edits the longURL in the database
app.post('/urls/:id', (req, res) => {
urlDatabase[req.params.id] = req.body["longURL"]
  return res.redirect('/urls');
});

//
//Delete
//

//Deletes the selected entry from the database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});

//Registers user and saves info to new object in user database
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password){
    res.status(400);
    return res.send('One or more fields is empty. Please enter a valid email and password.')
  } else if (getUserByEmail(req.body.email)) {
    res.status(400);
    return res.send('An account with that email already exists.')
  }  else {
  const randomID = generateRandomString()
  const user = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  }
  users[user.id] = user
  res.cookie('user_id', user.id)
  return res.redirect('/urls')
  }
});