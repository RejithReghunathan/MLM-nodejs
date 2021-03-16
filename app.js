var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const Handlebars = require("handlebars");
const fileUpload = require("express-fileupload");
// const fileUpload = require("express-fileupload");
const hbs = require("express-handlebars");
const dotenv=require('dotenv').config()

const db =require('./config/connection')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');

var app = express();

// Session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 5000000 },
  })
);
// cache clear
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

// view engine setup
app.engine(
  "hbs",
  hbs({
    helpers: {
      math: function (lvalue, operator, rvalue) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue,
        }[operator];
      },
      ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      }
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials",
  })
);
app.set('view engine', 'hbs');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Database connection
db.connect(function done(err){
  if(err){
    console.log("Connection Failed" + err);
  }else{
    console.log("Database connected successfully");
  }
})

app.use('/admin', adminRouter);
app.use('/',userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
