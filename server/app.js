var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

const session = require('express-session');
const mongoSotre = require('connect-mongo')(session);

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var userComment = require('./routes/userComment');
var articleCategory = require('./routes/articleCategory');
var article = require('./routes/article');
var opinion = require('./routes/opinion');
var articleComment = require('./routes/articleComment');
var project = require('./routes/project');
var projectComment = require('./routes/projectComment');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// set html
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// 连接MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/personalweb');

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected success');
});

mongoose.connection.on('error', () => {
    console.log('MongoDB connected fail');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connected disconnected');
});
app.use(session({
	secret: 'personalweb',
	// 配置
	store : new mongoSotre({
		url: 'mongodb://localhost:27017/personalweb',
		collection: 'session'
	})
}));


app.use('/', index);
app.use('/api/users', users);
app.use('/api/usercomment', userComment);
app.use('/api/articlecategory', articleCategory);
app.use('/api/article', article);
app.use('/api/opinion', opinion);
app.use('/api/articlecomment', articleComment);
app.use('/api/project', project);
app.use('/api/projectcomment', projectComment);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
// file 表单提交
app.use(require('connect-multiparty')());
// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
