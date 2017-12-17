var express = require('express');
var router = express.Router();
let Project = require('../models/project');
let User = require('../models/user');
let ProjectComment = require('../models/projectComment');

// 项目类型要与前端对应
const TYPE = {
	xcx: '小程序',
	h5: 'h5',
	app: 'APP',
	android: 'Android',
	qd: '前端',
	php: 'PHP'
}
router.post('/create', (req, res, next) => {
	let data = req.body;
	let projectId = data.projectId;
	let cookieUser = req.session.user;
	data.user = cookieUser._id;
	data.type = TYPE[data.type]; // 添加对应的类型
	data.time = new Date(data.time).getTime()
	if (cookieUser) {
		if (!projectId) { // 判断是否是修改
			let newProject = new Project(data);
			newProject.save((err, project) => {
				// 项目人添加项目到 createProjects
				User.findOne({_id: cookieUser._id }, (err, user) => {
					if (user) {
						user.createProjects.unshift({ 
							project: project._id,
							time: new Date().getTime() 
						});
						user.save();
					}
				})
				res.json({
					status: 200,
					msg: '创建项目成功',
					result: {
						project
					}
				})
			})
		} else {
			// 修改
			Project.findOne({_id: projectId}, (err, project)=> {
				if (err) {
					res.json({status: 401, msg: err.message});
				} else {
					if (project) {
						// 判断是否有权限修改
						if (project.user == cookieUser._id) {
							if (project.time > new Date().getTime()) {
								Project.update({_id: projectId}, data, function() {
									res.json({
										status: 200,
										msg: '修改项目成功',
										result: {
											project: {
												_id: projectId
											}
										}
									})
								})
							} else {
								res.json({status: 204, msg: '该项目已经过期不能修改'});
							}
						} else {
							res.json({status: 202, msg: '你没有权限修改该项目!'})
						}
					} else {
						res.json({status: 201, msg: '没有找到该项目'});
					}
				}
			})
		}
	} else {
		res.json({ status: 201, msg: '请先登录' });
	}
});

// 获得项目列表
router.get('/list', (req, res, next) => {
	Project.update({time: {$lt: new Date().getTime()}},{'isOverdue':true}, { multi: true },function(){
		Project.find({})
		.populate({path: "user", select: 'sex userName avatar role'})
		.populate({path: "endUser", select: 'sex userName avatar role'})
		.exec((err, projects) => {
			if (err) {
				res.json({ status: 401, msg: err.message });
			} else {
				res.json({ 
					status: 200, 
					msg: '获取项目列表成功',
					result: {
						projects
					}
				})
			}
		})
	});
})

// 获得项目详情
router.get('/detail', (req, res, next) => {
	let { projectId } = req.query;
	Project.findOne({_id: projectId})
	.populate({path: "user", select: 'sex userName avatar role'})
	.populate({path: "endUser", select: 'sex userName avatar role'})
	.exec((err, project) => {
		if (err) {
			res.json({ status: 401, msg: err.message });
		} else {
			if (project) {
				if (project.time < new Date().getTime()) {
					project.isOverdue = true;
					project.save();
				}
				res.json({ 
					status: 200, 
					msg: '获取项目信息成功',
					result: {
						project
					}
				})
			} else {
				res.json({status: 201, msg: '没有找到该项目!'});
			}
		}
	})
})

router.post('/care', (req, res, next) => {
	// cancel 为true 的时候就是取消
	let { _id, cancel } = req.body;
	let cookieUser = req.session.user;
	if (cookieUser) {
		Project.findOne({_id})
		.exec((err, project) => {
			if (err) {
				res.json({ status: 401, msg: err.message })
			} else {
				if (project) {
					// 判断是项目是否过期
					if (project.time < new Date().getTime()) { 
						res.json({
							status: 202,
							msg: '项目已经过期了！'
						})
					} else {
						// 用户收藏的项目列表 添加项目
						User.findOne({_id: cookieUser._id},(err, user) => {
							user.careProjects.forEach((item, index) => {
								if ((item.project + "") == (project._id + "")) {
									user.careProjects.splice(index, 1)
									return;
								}
							});
							// 项目收藏者列表 添加用户
							project.careUsers.forEach((item, index) => {
								if (item.user == cookieUser._id) {
									project.careUsers.splice(index, 1)
									return;
								}
							});
							if (!cancel) { // 判断是取消还是添加关注
								project.careUsers.unshift({
									user: cookieUser._id,
									time: new Date().getTime()
								});
								user.careProjects.unshift({
									project: project._id,
									time: new Date().getTime()
								});
							}
							user.save();
							project.save(() => {
								res.json({
									status: 200,
									msg: '收藏项目成功!'
								})
							})
						})
					}
				} else {
					res.json({ status: 203, msg: '没有此项目' })
				}
			}
		})
	} else {
		res.json({ status: 201, msg: '请先登录!' })
	}
	
})

// 设置/取消项目承接人

router.post("/setenduser", (req, res, next) => {
	/**
	 * projectId 项目id
	 * userId 用户id
	 * cancel 有值得时候代表取消接单人
	 */
	let { projectId, userId, cancel } = req.body;
	let cookieUser = req.session.user;
	Project.findOne({_id: projectId}, (err, project) => {
		if (err) {
			res.json({ status: 401, msg: err.message });
		} else {
			if (project) {
				// 判断项目是否过期
				if (project.time < new Date().getTime()) {
					res.json({status: 203, msg: '项目已经过期了!'});
				} else {
					if (project.user == cookieUser._id) { // 判断权限
						if (!cancel) {
							if (project.endUser) { // 判断有没有人接
								res.json({ status: 201, msg: '该项目已经有人接啦'})
							} else {
								// 用户承接项目添加
								User.findOne({_id: userId}, (err, user) => {
									user.holdProjects.unshift({
										project: projectId,
										time: new Date().getTime()
									});
									user.save();
									project.endUser = userId;
									project.save(()=> {
										res.json({ status: 200, msg: '设置项目承接人成功!'});
									})
								})
							}
						} else {
							// 取消承接人
							User.findOne({_id: userId}, (err, user) => {
								user.holdProjects.forEach((item,index) => {
									if (item.project == projectId) {
										user.holdProjects.splice(index, 1);
										return;
									}
								})
								user.save();
								Project.update({_id: projectId},{$unset:{endUser:''}}, false, function () {
									res.json({ status: 200, msg: '删除项目承接人成功!'});
								})
							})
						}
					} else {
						res.json({ status: 201, msg: '没有权限设置/取消项目承接人'});
					}
				}
			} else {
				res.json({ status: 201, msg: '没找到对应的项目'});
			}
		}
	})
});

// 删除项目
router.post('/delete', (req, res, next) => {
	let { projectId } = req.body;
	let cookieUser = req.session.user;
	if (cookieUser) {
		Project.findById(projectId, (err, project) => {
			if (err) {
				res.json({status: 401, msg: err.message});
			} else {
				if (project) {
					// 判断权限
					if (cookieUser.role >= 10 || cookieUser._id == project.user) {
						// 把和项目相关的一些删除
						User.update({},{'$pull': {careProjects: {project : projectId }}}, { multi: true }, () => {
							User.update({},{'$pull': {createProjects: {project : projectId }}}, { multi: true }, () => {
								User.update({},{'$pull': {holdProjects: {project : projectId }}}, { multi: true }, () => {
									ProjectComment.remove({project: projectId},()=> {
										Project.remove({_id: projectId}, (err) => {
											if (err) {
												res.json({status: 401, msg: err.message});
											} else {
												res.json({ status: 200, msg: '删除项目成功!'});
											}
										})
									});
								})
							})
						})
					} else {
						res.json({status: 202, msg: '你没有权限删除此项目!'})
					}
				} else {
					res.json({status: 201, msg: '项目已经删除了!'})
				}
			}
		})
	} else {
		res.json({status: 201, msg: '请先登录'})
	}
})
module.exports = router;