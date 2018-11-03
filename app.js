const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var session = require('express-session');
const expressValidator = require('express-validator');

var config = require('./config/db');

mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable (this fixes a problem with rendering errors in add-page)
app.locals.errors = null;

app.use(expressValidator());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// set routes | requesting root directory ('/') will lead to pages.js's routes
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js')

app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);

var port = 3000;
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})
