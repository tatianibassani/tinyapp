const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['SHA384', 'base64']
}));

const PORT = 8080; 

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(7);
};

const urlsForUser = function(id) {
  const userUrls = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      Object.assign(userUrls, {[key]:urlDatabase[key]});
    }
  }

  return userUrls;
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$ot3mVXNF9Gjxmtyt3Zu7NeOktm1xIN8JnUl0zVUiFWTxpeyNoZKBS",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$ot3mVXNF9Gjxmtyt3Zu7NeOktm1xIN8JnUl0zVUiFWTxpeyNoZKBS",
  },
};

const isLoggedIn = function(req, res) {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (!req.session.user_id) {
    res.redirect('/error');
  }

  const userUrls = urlsForUser(user.id);

  const templateVars = {
    urls: userUrls,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  isLoggedIn(req, res);

  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/error');
  }

  const user = users[req.session.user_id];

  const userUrls = urlsForUser(user.id);

  if (!userUrls[req.params.id]) {
    res.redirect("/error");
  }
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.render('error');
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect('/urls');
  }
  res.render("register");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  const templateVars = {
    user
  };
  return res.render('login', templateVars);
});

app.get("/error",(req, res) => {
  return res.render('error');
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/error');
  }

  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  Object.assign(urlDatabase, {[shortUrl]: {
    longURL,
    userID: req.session.user_id
  }});
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  const user = users[req.session.user_id];
  const userUrls = urlsForUser(user.id);

  if (!userUrls[id]) {
    res.redirect("/error");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;

  const user = users[req.session.user_id];
  const userUrls = urlsForUser(user.id);

  if (!userUrls[id]) {
    res.redirect("/error");
  }

  const longUrl = req.body.longURL;
  urlDatabase[id].longURL = longUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);

  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
  res.sendStatus('403');
});


app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.render('error');
  }

  const user = getUserByEmail(email, users);

  if (user) {
    return res.render('error');
  }

  const encryptedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    password: encryptedPassword
  };

  req.session.user_id = id;

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});