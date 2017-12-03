var express = require('express');
var router = express.Router();

let Article = require('../models/article');
let ArticleCategory = require('../models/articleCategory');
let User = require("../models/user");
const path = require('path');
const fs = require('fs');
const multipart = require('connect-multiparty');
const URL = require('url');
// 储存文章里的图片
router.post('/images', multipart(), (req, res, next) => {
    let dataImage = req.files.articleImages;
    if (dataImage.length > 0) {
        var data = [];
        dataImage.forEach((item) => {
            let filename = item.originalFilename;
            let ArrayName = filename.split('.');
            ArrayName.splice(ArrayName.length - 1, 0, (new Date().getTime() + Math.ceil(Math.random() * 10) + '.'));
            filename = ArrayName.join('');
            //复制文件到指定路径
            let targetPath = path.join(__dirname,'../','/public/articleImages/' + filename);
            //复制文件流
            fs.createReadStream(item.path).pipe(fs.createWriteStream(targetPath));
            //响应ajax请求，告诉它图片传到哪了
            data.push('/articleImages/' + filename)
        });
        res.json({ errno: 0, data: data });
    } else {
        let filename = dataImage.originalFilename;
        let ArrayName = filename.split('.');
        ArrayName.splice(ArrayName.length - 1, 0, (new Date().getTime() + Math.ceil(Math.random() * 10) + '.'));
        filename = ArrayName.join('');
        //复制文件到指定路径
        let targetPath = path.join(__dirname,'../','/public/articleImages/' + filename);
        //复制文件流
        fs.createReadStream(dataImage.path).pipe(fs.createWriteStream(targetPath));
        //响应ajax请求，告诉它图片传到哪了
        res.json({ errno: 0, data: ['/articleImages/' + filename ] });
    }
})

// 创建文章
router.post('/create', (req, res, next) => {
		let data = req.body;
		let cookieUser = req.session.user;
		if (cookieUser) {
			// 判断文章名字是否存在
			Article.findOne({name: data.name}, (err, artice) => { 
				if (artice) {
					res.json({
						status: 201,
						msg: '文章名已经存在!'
					})
				} else {
					let cateArray = data['categories[]'];
					let categories = []
	
					// 判断文章是多选还是单选 单选改成多选形式
					if (!(cateArray instanceof Array)) {
						let arr = [];
						arr.push(cateArray);
						cateArray = arr;
					}
	
					// 改成符合服务器数据的格式
					cateArray.forEach((item) => {
						categories.push({ category: item})
					})
					data.categories = categories;
	
					// 创建时间 和 更新时间 作者
					data.createTime = data.updateTime = new Date().getTime();
					data.author = cookieUser._id;
					// 创建新文章
					let newArticle = new Article({
						name: data.name,
						categories: data.categories,
						describe: data.describe,
						author: data.author,
						createTime: data.createTime,
						updateTime: data.updateTime,
						content: data.content,
					});
					newArticle.save((err, article) => {
						if (err) {
							res.json({
								status: 401,
								msg: err.message
							})
						} else {

							// 为用户添加文章
							User.findOne({_id: cookieUser._id}, (err, user) => {
								if (user) {
									user.articles.unshift({
										article: article._id
									})
									user.save();
								}
							})

							// 在分类列表中添加文章
							cateArray.forEach((item) => {
								ArticleCategory.findOne({_id: item}, (err, articleCategory) => {
									articleCategory.articles.unshift({ article: article._id});
									articleCategory.save();
								})
							});
							
							res.json({
								status: 200,
								msg: '创建文章成功!',
								result: {
									_id: article._id
								}
							})
						}
					})
				}
			})
		} else {
			res.json({
				status: 201,
				msg: '请先登录!'
			})
		}
})

// 获取文章列表
router.get('/list', (req, res, next) => {
	let category = req.query.category;
	let author = req.query.author;
	let parmas = {};
	if (category) {
		parmas['categories.category'] = category;
	}
	if (author) {
		parmas['author'] = author;
	}
	Article.find(parmas)
  .populate({path: 'author', select: 'sex userName avatar'})
  .populate({path: 'categories.category', select: 'name _id'})
  .exec((err, articles) => {
    if (err) {
      res.json({
        status: 401,
        msg: err.message
      })
    } else {
      res.json({
        status: 200,
        msg: '获取文章列表成功!',
        result: {
          articles
        }
      })
    }
  })
})

// 获得文章信息
router.post('/detail', (req, res, next) => {
	let _id = req.body._id;
	if (_id) {
		Article.findOne({ _id })
		.populate({ path: 'author', select: 'userName sex avatar' })
		.populate({ path: 'categories.category', select: 'name _id' })
		.populate({ path: 'browses.user', select: 'userName sex avatar' })
		.populate({ path: 'likes.user', select: 'userName sex avatar' })
		.exec((err, article) => {
			if (err) {
				res.json({ status: 401,msg: err.message });
			} else {
				if (article) {
					let cookieUser = req.session.user;
					if (cookieUser) { // 判断是否浏览过
						article.browses.forEach((item, index) => {
								if (item.user._id == cookieUser._id) {
									article.browses.splice(index, 1);
									return;
								}
						})
						article.browses.unshift({ user: cookieUser._id, time: new Date().getTime() });
						article.save((err, article) => {
							article.populate({ 
								path: 'browses.user',
								select: 'userName sex avatar'
							}, (err,article) => {
								res.json({
									status: 200,
									msg: '获取文章信息成功!',
									result: { article }
								})
							})
						})
					} else {
						res.json({ status: 200,msg: '获取文章信息成功!',result: { article } })
					}
				} else {
					res.json({ status: 201,msg: '文章已经不存在!'})
				}
			}
		})
	} else {
		res.json({
			status: 201,
			msg: '文章id错误'
		})
	}
})
module.exports = router;