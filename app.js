var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const puppeteer = require('puppeteer');
const { v1: uuidv1 } = require('uuid');

var app = express();

const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/download', (req, res) => {
  
    const uuid = uuidv1();

    const generatePDF = async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('http://localhost:3000/');
      await page.emulateMedia('screen');
      await page.pdf({
        path: `./pdf/${uuid}.pdf`,
        printBackground: true,
        format: 'A4',
        width: '210mm',
        height: '297mm',
      });
      await browser.close();

      const file = `${__dirname}/pdf/${uuid}.pdf`;
      res.download(file);
  }

  generatePDF();

  // res.send('Hello World!')
})

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
