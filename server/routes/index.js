var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/list', function(req, res, next) {
  res.render('index');
});
router.get('/user/detail/*', function(req, res, next) {
  res.render('index');
});
router.get('/user/list', function(req, res, next) {
  res.render('index');
});
router.get('/articlecategory/create', function(req, res, next) {
  res.render('index');
});
router.get('/article/detail/*', function(req, res, next) {
  res.render('index');
});
router.get('/article/create', function(req, res, next) {
  res.render('index');
});
router.get('/project/detail/*', function(req, res, next) {
  res.render('index');
});
router.get('/project/create', function(req, res, next) {
  res.render('index');
});
router.get('/project/list', function(req, res, next) {
  res.render('index');
});
router.get('/opinion', function(req, res, next) {
  res.render('index');
});
module.exports = router;
