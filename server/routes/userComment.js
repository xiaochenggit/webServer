let express = require('express');
let router = express.Router();
let UserComment = require('../models/userComment');


// 获取留言
router.post('/getlist', (req, res, next) => {
  let user = req.body.user;
  if (user) {
    UserComment.find({user})
    .populate({path: 'from', select: 'userName sex avatar' })
    .populate({path: 'reply.from reply.to', select: 'userName sex avatar' })
    .exec((err, userComments) => {
      if (err) {
        res.json({
          status: 401,
          msg: err.message
        })
      } else {
        res.json({
          status: 200,
          msg: '获取留言成功!',
          result:  userComments
        })
      }
    })
  } else {
    res.json({
      status: 201,
      msg: '用户不存在获取信息失败!'
    });
  }
});

// 留言创建
router.post('/create', (req, res, next) => {
  let cookieUser = req.session.user;
  if (cookieUser) {
    if (req.body.cId != 0) { // 创建2级留言
      let cId = req.body.cId;
      let to = req.body.to
      UserComment.findOne({_id: cId}, (err, userComment) => {
        if (err) {
          res.json({
            status: 401,
            msg: err.message
          })
        } else { 
          if (userComment) {
            userComment.reply.push({
              from: cookieUser._id,
              to,
              content: req.body.content,
              createTime: new Date().getTime()
            });
            userComment.save(()=> {
              res.json({
                status: 200,
                msg: '留言成功!'
              })
            });
          } else {
            res.json({
              status: 201,
              msg: '留言已经删除'
            })
          }
        }
      })
    } else { // 一级留言
      let userComment = {
        content: req.body.content,
        to: req.body.to,
        user: req.body.user,
        from: cookieUser._id, 
        createTime: new Date().getTime()
      }
      let newUserComment = new UserComment(userComment);
      newUserComment.save((err) => {
        if (err) {
          res.json({
            status: 401,
            msg: err.message
          });
        } else {
          res.json({
            status: 200,
            msg: '留言成功!'
          })
        }
      })
    }
  } else {
    res.json({
      status: 201,
      msg: '请用户登录!'
    })
  }
});
// 删除留言
router.post('/delete', (req, res, next) => {
  let cookieUser = req.session.user;
  let _id = req.body.id;
  let cId = req.body.cId;
  if (cookieUser) { // 判断有没有登录
    if (cId != 0) { // 删除2级留言..
      UserComment.findOne({_id: cId}, (err, usercomment) => {
        if (err) {
          res.json({
            status: 401,
            msg: err.message
          })
        } else{
          if (usercomment) { // 是否存在该留言
            usercomment.reply.forEach((item, index) => {
              if (item._id == _id) {
                if (cookieUser._id == usercomment.user || 
                    cookieUser.role > 0 || 
                    cookieUser._id == item.from) { // 权限问题
                    usercomment.reply.splice(index, 1);
                    usercomment.save(() => {
                      res.json({
                        status: 200,
                        msg: '删除留言成功!'
                      })
                    })
                } else {
                  res.json({
                    status: 201,
                    msg: '你没有权限删除该留言!'
                  })
                }
              }
            });
          } else {
            res.json({
              status: 201,
              msg: '该留言已经删除!'
            })
          }
        }
      })
    } else { // 删除1级留言..
      UserComment.findOne({_id}, (err, usercomment) => {
        if (err) {
          res.json({
            status: 401,
            msg: err.message
          })
        } else{
          if (usercomment) { // 是否存在该留言
            if (cookieUser._id == usercomment.user 
              || cookieUser.role > 0 
              || cookieUser._id == usercomment.from) { // 权限问题
              UserComment.remove({_id}, () => {
                res.json({
                  status: 200,
                  msg: '删除留言成功!'
                });
              })
            } else {
              res.json({
                status: 201,
                msg: '你没有权限删除该留言!'
              })
            }
          } else {
            res.json({
              status: 201,
              msg: '该留言已经删除!'
            })
          }
        }
      })
    }
  } else {
    res.json({
      status: 201,
      msg: '请先登录!'
    });
  }
})
module.exports = router;