let express = require('express');
let router = express.Router();
let UserComment = require('../models/userComment');

// 获得列表
router.get('/list', (req, res, next) => {
  /**
   * page 页码
   * pageNum 页面条目
   */
  let { page, pageNum, typeId } = req.query;
  UserComment.find({user: typeId})
  .skip(parseInt(page) * parseInt(pageNum))
  .limit(parseInt(pageNum))
  .populate({path: 'from', select: 'userName sex avatar role'})
  .populate({path: 'reply.from reply.to', select: 'userName sex avatar role'})
  .sort({'createTime': -1})
  .exec((err, opinions) => {
    if (err) {
      res.json({ status: 401, msg: err.message });
    } else {
      res.json({ status: 200, msg: '获得留言列表成功!',
        result: {
          opinions
        }
      })
    }
  })
});

// 创建
router.post('/create', (req, res, next) => {
  /**
   * type {String} content 内容
   * type {Number} cId 主回复 id
   * type {Number} to 回复给谁 id
   */
  let { content, cId, to, typeId } = req.body;
  let cookieUser = req.session.user;
  if (cookieUser) {
    if (!cId) { // 一级回复
      let opinion = {
        user: typeId,
        content,
        from: cookieUser._id,
        createTime: new Date().getTime()
      };
      let newOpinion = new UserComment(opinion);
      newOpinion.save((err, opinion) => {
        newOpinion.populate([
            {path: 'from', select: 'userName sex avatar role'}
          ],
          (err, opinion) => {
          res.json({
            status: 200,
            msg: '创建留言成功!',
            result: {
              opinion 
            }
          })
        })
      })
    } else { // 二级回复
      UserComment.findOne({_id: cId}, (err, opinion) => {
        if (err) {
          res.json({ status: 401, msg: err.message })
        } else { 
          if (opinion) {
            opinion.reply.push({
              from: cookieUser._id,
              to,
              content: req.body.content,
              createTime: new Date().getTime()
            });
            opinion.save((err, opinion) => {
              opinion.populate([
                  {path: 'from', select: 'userName sex avatar role'},
                  {path: 'reply.from', select: 'userName sex avatar role'},
                  {path: 'reply.to', select: 'userName sex avatar role'}
                ],
                (err, opinion) => {
                res.json({
                  status: 200,
                  msg: '创建留言成功!',
                  result: {
                    opinion 
                  }
                })
              });
            });
          } else {
            res.json({ status: 201, msg: '留言已删除!' })
          }
        }
      })
    }
  } else {
    res.json({ status: 201, msg: '请先登录！' })
  }
});

// 删除
router.post('/delete', (req, res, next) => {
  let cookieUser = req.session.user;
  if (cookieUser) {
    /**
     * id 主回复 id
     * replyId 回复的 id 
     */
    let { id, replyId } = req.body;
    UserComment.findOne({_id: id})
    .exec((err, opinion) => {
      if (err) {
        res.json({ status: 401, msg: err.message });
      } else {
        if (opinion) { // 是否存在
          if (!replyId) { // 一级
            if (cookieUser.role >= 10 ||
            opinion.from == cookieUser._id ||
            opinion.user == cookieUser._id) { // 权限判断
              UserComment.remove({_id: id}, () => {
                res.json({ status: 200, msg: '删除留言成功!'})
              })
            } else {
              res.json({ status: 201, msg: '你没有权限删除此留言!'})
            }
          } else { // 二级
            let isDelete = false;
            opinion.reply.forEach((item, index) => { // 找到二级
              if (item._id == replyId) {
                if (cookieUser.role >= 10 ||
                item.from == cookieUser._id ||
                opinion.user == cookieUser._id) { // 判断权限
                  opinion.reply.splice(index, 1);
                  isDelete = true;
                }
                return false;
              }
            });
            if (isDelete) {
              opinion.save(() => {
                res.json({ status: 200, msg: '删除留言成功!'})
              })
            } else {
              res.json({ status: 201, msg: '你没有权限删除此留言!'})
            }
          }
        } else {
          res.json({ status: 200, msg: '留言已经删除!' });
        }
      }
    })
  } else {
    res.json({ status: 201, msg: '请先登录!' });
  }
});
module.exports = router;