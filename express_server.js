const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7);
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const isLoggedIn = function(req, res) {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
}

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];

  isLoggedIn(req, res);

  const templateVars = { 
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];

  isLoggedIn(req, res);

  const templateVars = { 
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  isLoggedIn(req, res);
  if (!urlDatabase[req.params.id]) {
    res.redirect("/error");
  }
  const user = users[req.cookies.user_id];
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  isLoggedIn(req, res);

  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  const longUrl = req.body.longURL;
  urlDatabase[id] = longUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user;

  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      user = users[key];
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  }
  res.sendStatus('403');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
})

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.sendStatus(400).send('Email cannot be empty');
  }

  let emailFound = false;
  for (let key in users) {
    if (users[key].email === email) {
       emailFound = true;
    }
  }

  if (emailFound) {
    return res.sendStatus(400).send('Email already exists');
  }

  users[id] = {
    id,
    email,
    password
  };

  res.cookie('user_id', id);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  return res.render('login');
});

app.get("/error", (req, res) => {
  return res.render('error');
});