const express = require("express");
const cookieParser = require("cookie-parser");
const { users } = require("./database");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
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

app.get("/urls", (req, res) => {
  //console.log(users[req.cookies["user_id"]]);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});
//*
app.get("/urls/new", (req, res) => {
  isLoggedIn(req, res);

  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  } else {
    if (urlDatabase[req.params.id] === undefined) {
      res.status(400).send('Page not found.');
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
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = { 
    user: undefined
  };
  return res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  
  const templateVars = { 
    user: undefined
  };
  return res.render('login', templateVars);
});
  
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(401).send('You are not logged in. Please log in and try again.');
  }

  let shortUrl = generateRandomString();
  let longUrl = req.body.longURL;

  Object.assign(urlDatabase, {[shortUrl]: longUrl});

  //res.redirect(`/urls/${shortUrl}`);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  
  urlDatabase[id] = req.body.newValue;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send('Wrong credentials!');
  }

  if (password === user.password) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send('Wrong credentials!');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  let user = getUserByEmail(email, users);
  let userExists = user !== undefined;

  if (!email || !password) {
    res.status(400).send('Email and password cannot be empty.')
  } else if (userExists) {
    res.status(403).send('User already exists.')
  } else {
    Object.assign(users, {[id]: 
      Object.assign({}, {id, email, password})
    });

    res.cookie('user_id', id);

    res.redirect("/urls");
  
  }
});

function generateRandomString() {
  const char = "abcdefghijklmnopqrstuvwxyz"
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char.charAt(randomIndex);
  }

  return randomString;
}

function getUserByEmail(email, users) {
  for (let u in users) {
    if (users[u].email == email) {
      return users[u];
    }
  }
  return undefined;
}

const isLoggedIn = function(req, res) {
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  }
};