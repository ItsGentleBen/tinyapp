const express = require("express");
const cookieSession = require('cookie-session')
const morgan = require('morgan')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//
//Middleware
//
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['uwusecretkey', 'superdupertotallysecretkey', 'smartiesturtleobiwannightshade'],

}))

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
const getUserByEmail = (userEmail, users) => {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  } return null;
};

//function that return the urls of currently logged in user
const urlsForUser = (id) => {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url]
    }
  }
  return userURLs
};

//Placeholder Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
/////////////////////////////////////////////////////////////////////////////

//logs in user when submitted 
app.post('/login', (req, res) => {
  const loginEmail = req.body.email
  const loginPassword = req.body.password
  const user = getUserByEmail(loginEmail, users)
  const password = user.password
  const passwordCheck = bcrypt.compareSync(loginPassword, password);
  if (!user || !passwordCheck) {
    res.status(403);
    return res.send('Email or Password is incorrect.')
  } 
  req.session.user_id = user.id
  return res.redirect('/urls');
  });

//Logs out current user
app.post('/logout', (req, res) => {
  // req.session = null
  req.session.user_id = null
  return res.redirect('/login');
  });

//Page that lists all URLs and their shortened forms
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user_id),
    users,
    user: users[req.session.user_id]
  };
  
  if (!req.session.user_id) {
    res.status(403);
    return res.send('Please Log in to view this page')
  } 

  return res.render("urls_index", templateVars);
  });


  //Page to add new URLs to "database"
  app.get("/urls/new", (req, res) => {
    const templateVars = { 
      user: users[req.session.user_id]
    };
  
    if (!req.session.user_id) {
      return res.redirect('/login');
    } 

    return res.render("urls_new", templateVars);
  });
  

//Page that shows a specific URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const templateVars = { 
    id,
    users,
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.status(401)
    return res.send('You must be logged in to view');
  } 
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403);
    return res.send('You are not allowed access to this users URL')
  }
  templateVars['longURL'] = urlDatabase[id].longURL;
  return res.render("urls_show", templateVars);
});


//Redirects from shortened URL to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404);
    return res.send('Page does not exist')
  }
  const longURL = urlDatabase[id].longURL;
  return res.redirect(longURL);
});


//Directs to registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id]
  };

  if (!req.session.user_id) {
    return res.render("register", templateVars);
  }
    return res.redirect('/urls');
  });


  //Directs to login page
  app.get("/login", (req, res) => {
    const templateVars = { 
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
  
    if (!req.session.user_id) {
      return res.render("login", templateVars);
    }
      return res.redirect('/urls');
    });
  

//Generates a random string when a url is submitted in /urls/new, saves it to the database
//then redirects to the page displaying that specific pair of short/long URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  if (!req.session.user_id) {
    res.status(401);
    return res.send('Must log in before shortening URL.')
  }

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  return res.redirect(`/urls/${shortURL}`);
});

//Registers user and saves info to new object in user database
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password){
    res.status(400);
    return res.send('One or more fields is empty. Please enter a valid email and password.')
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400);
    return res.send('An account with that email already exists.')
  }  else {
  const randomID = generateRandomString()
  const noHashPassword = req.body.password
  const hashedPassword = bcrypt.hashSync(noHashPassword, 10);
  const user = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword
  }
  users[user.id] = user
  req.session.user_id = user.id
  return res.redirect('/urls')
  }
});

//Edits the longURL in the database
app.post('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404)
    return res.send('ID not found');
  }
  if (!req.session.user_id) {
    res.status(401)
    return res.send('You must be logged in to edit');
  } 
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403);
    return res.send('You are not allowed to edit this users URL')
  }

  urlDatabase[req.params.id].longURL = req.body.longURL
    return res.redirect('/urls');
  });
  

//Deletes the selected entry from the database
app.post('/urls/:id/delete', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404)
    return res.send('ID not found');
  }
  
  if (!req.session.user_id) {
    res.status(401)
    return res.send('You must be logged in to delete');
  } 
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403);
    return res.send('You are not allowed access to delete this users URLS')
  }
  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});






//Current homepage. To be fixed I assume
app.get("/", (req, res) => {
  return res.redirect('/register');
});



