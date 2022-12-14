const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail,
        generateRandomString,
        urlsForUser,
        isLoggedIn } = require('./helpers');
const {urlDatabase, users} = require('./database');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['SHA384', 'base64']
}));

const PORT = 8080; 

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (!req.session.user_id || !user) {
    const message = {
      message: "You should be logged in to access this page."
    };
    res.render('error', message);
  } else {
    const userUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = {
      urls: userUrls,
      user
    };
    res.render("urls_index", templateVars);
  }
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
    const message = {
      message: "You are not logged in. Please log in and try again."
    };
    res.render('error', message);
  } else {
    const user = users[req.session.user_id];

    const userUrls = urlsForUser(user.id, urlDatabase);

    if (!userUrls[req.params.id] || !user) {
      const message = {
        message: "You are not authorized to access this page."
      };
      res.render('error', message);
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
  res.redirect("/urls/"+shortUrl);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  const user = users[req.session.user_id];
  const userUrls = urlsForUser(user.id, urlDatabase);

  if (!userUrls[id]) {
    res.redirect("/error");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;

  const user = users[req.session.user_id];
  const userUrls = urlsForUser(user.id, urlDatabase);

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

  if (!user) {
    res.sendStatus('403');
  }

  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
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