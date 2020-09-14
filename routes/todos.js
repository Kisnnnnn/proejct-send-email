'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var porjectList = AV.Object.extend('porjectList');
var userAPI = AV.Object.extend('_User');

// 查询 Todo 列表
router.get('/project', function (req, res, next) {
  var query = new AV.Query(porjectList);
  query.descending('createdAt');
  query.find().then(function (results) {
    res.render('porjectList', {
      title: '项目列表',
      todos: results
    });
  }, function (err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('porjectList', {
        title: '项目列表',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
});

var porjectList = AV.Object.extend('porjectList');

// 查询 Todo 列表
router.get('/users', function (req, res, next) {
  var query = new AV.Query(userAPI);
  query.descending('createdAt');
  query.find().then(function (results) {
    res.render('users', {
      title: '用户',
      todos: results
    });
  }, function (err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('users', {
        title: '用户',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
});

// 新增 Todo 项目
router.post('/', function (req, res, next) {
  var content = req.body.content;
  var todo = new porjectList();
  todo.set('content', content);
  todo.save().then(function (todo) {
    res.redirect('/todos');
  }).catch(next);
});

module.exports = router;