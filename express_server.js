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
    console.log(users[req.cookies["username"]]);
    const templateVars = { 
      urls: urlDatabase,
      user: users[req.cookies["username"]]
    };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    const templateVars = { 
      user: users[req.cookies["username"]]
    };
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

  app.get("/u/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  });

  app.get("/register", (req, res) => {
    //res.redirect('/urls');
  
  res.render("register");
});
  
// //new******
//   app.get("/urls", (req, res) => {
//     const templateVars = {
//       username: req.cookies["username"],
//       // ... any other vars
//     };
//     console.log(templateVars);
//     res.render("urls_index", templateVars);
//   });

  //app.use(express.urlencoded({ extended: true }));

  app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console

    let shortUrl = generateRandomString();
    let longUrl = req.body.longURL;

    Object.assign(urlDatabase, {[shortUrl]: longUrl});

    res.redirect(`/urls/${shortUrl}`);
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
    const username = req.body.username;

    res.cookie('username', username);
    res.redirect("/urls");

   });

   app.post("/logout", (req, res) => {
    //console.log('logging out');
    res.clearCookie('username');
    res.redirect("/urls")
   });

   app.post("/register", (req, res) => {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;

    let userExists = false;
    for (let u in users) {
      if (users[u].email === email) {
        userExists = true;
      }
    }

    if (!email || !password || userExists) {
      res.sendStatus(400);
    } else {
      Object.assign(users, {[id]: 
        Object.assign({}, {id, email, password})
      });

      res.cookie('username', id);

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
  
  const shortURL = generateRandomString();
  //console.log(shortURL);
  