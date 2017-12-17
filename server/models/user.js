let mongoose = require('mongoose')
let Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
let userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": {
        type: String,
        default: ''
    },
    "phone": {
        type: String,
        default: ''
    },
    "role": {
        type: Number,
        default: 0
    },
    "loadTime": {
        type: Number,
        default: new Date().getTime()
    },
    "createTime": {
        type: Number,
        default: new Date().getTime()
    },
    "sex": {
        type: String,
        default: 'nan'
    },
    "articles": [{
        article: {
            type : ObjectId,
            ref : 'Article'
        }
    }],
    "avatar": {
        type: String,
        default: ''
    },
    // 粉丝
    follows: [{
        user: {
            type : ObjectId,
			ref : 'User'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }],
    // 关注的人
    cares: [{
        user: {
            type : ObjectId,
			ref : 'User'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }],
    // 创建的项目
    createProjects: [{
        project: {
            type : ObjectId,
            ref : 'Project'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }],
    // 收藏的项目
    careProjects: [{
        project: {
            type : ObjectId,
            ref : 'Project'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }],
    // 承接的项目
    holdProjects: [{
        project: {
            type : ObjectId,
            ref : 'Project'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }]
});

module.exports = mongoose.model('User', userSchema);