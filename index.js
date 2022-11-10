const db = require('./connection');
const path = require('path');

const express = require("express");
const app = express();
app.use(express.static(__dirname +'/public'));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

const bcrypt = require('bcryptjs');

const session = require("express-session");
const cookie = require("cookie-parser");
const flash = require("connect-flash");

app.use(cookie('secretString'));
app.use(session({
    secret: 'secretForSession',
    cookie: {maxAge: 60000},
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

const port = process.env.PORT || 5000;

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/public/index.html');
})

app.get('/register', function (req, res) {
    const message = req.flash('msg');
    res.render('register', { message });
})

app.post('/register',async function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    var password = req.body.password;
    const confirm_password = req.body.confirm_password;

    if(password != confirm_password) {
        req.flash("msg", "Passwords must be same");
        res.redirect("/register");
    } else {
        password = await bcrypt.hash(password, 8);
        db.connect((err) => {
            if(err) throw err;

            db.query("select email from userTable where email = '"+email+"'", function(err, result) {
                if(err) throw err;

                if(result.length === 0) {
                    const sql = "insert into userTable(name, email, password) values(?, ?, ?)";
                    db.query(sql, [name, email, password], function (err, result) {
                    if(err) throw err;
                    req.flash('Name', name);
                    res.redirect("/home");
                    })
                } else {
                    req.flash("msg", "The email '"+email+"' already exists");
                    res.redirect('/register');
                }
            })
        })
    }
})

app.get('/login', function(req, res) {
    const message = req.flash('msg');
    res.render('login', { message });
})

app.post('/login', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    db.query("select name, email, password from userTable where email = '"+email+"'", async function(err, result, fields) {
        if(err) throw err;

        if(result.length > 0 && await bcrypt.compare(password, result[0].password)) {
            req.flash('Name', result[0].name);
            res.redirect('/home');
        } else {
            req.flash('msg', 'Email or password is incorrect');
            res.redirect('/login');
        }
    })
})

app.get('/home', function(req,res) {
    const userName = req.flash('Name');
    if(userName.length == 0) {
        res.redirect('/');
    } else {
    res.render('home', { userName })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });