const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail,
        generateRandomString,
        isLoggedIn,
        renderUrls } = require('./helpers');
const {users, urlDatabase} = require('./database');

const app = express();

const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],

  maxAge: 24 * 60 * 60 * 1000 
}))

app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are not logged in. Please log in and try again.");
  }

  renderUrls(req, res, users, urlDatabase);
});

app.get("/urls/new", (req, res) => {
  isLoggedIn(req, res);

  const user = users[req.session.user_id];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  } else {
    if (!urlDatabase[req.params.id]) {
      res.status(400).send('Page not found.');
    }

    if (urlDatabase[req.params.id].userID !== user.id) {
      res.status(403).send("You don't have access to this page.");
    }

    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = { 
    user: undefined
  };
  return res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }
  
  const templateVars = { 
    user: undefined
  };
  return res.render('login', templateVars);
});
  
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  }

  let shortUrl = generateRandomString();
  let longURL = req.body.longURL;

  let newUrl = Object.assign({}, {
    longURL,
    userID: req.session.user_id
  })

  Object.assign(urlDatabase, {[shortUrl]: newUrl});

  renderUrls(req, res, users, urlDatabase);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.user_id];

  if (!urlDatabase[id]) {
    res.status(400).send("This URL does not exist.");
  }

  if (!user) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  }

  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send("You cannot delete this URL.");
  }
  
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const user = users[req.session.user_id];

  if (!urlDatabase[id]) {
    res.status(400).send("This URL does not exist.");
  }

  if (!user) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  }

  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send("You cannot edit this URL.");
  }
  
  urlDatabase[id].longURL = req.body.newValue;

  renderUrls(req, res, users, urlDatabase);
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);

  console.log(user);

  if (user === null) {
    res.status(403).send('Wrong credentials!');
  }

  //Use the bcrypt library to check if the password is correct
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send('Wrong credentials!');
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  let user = getUserByEmail(email, users);
  let userExists = user !== null;

  if (!email || !password) {
    res.status(400).send('Email and password cannot be empty.')
  } else if (userExists) {
    res.status(403).send('User already exists.')
  } else {
    //Encrypt the password using the bcrypt library
    const hashedPassword = bcrypt.hashSync(password, 10);
    Object.assign(users, {[id]: 
      Object.assign({}, {id, email, password: hashedPassword})
    });

    req.session.user_id = id;

    res.redirect("/urls");
  
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

