const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
/**
 * name 文章名字 唯一
 * content 内容
 * describe 文章描述
 * author 作者
 * likes 喜欢的人
 * collections 收藏的人
 * browses 浏览的人
 * updateTime 更新时间
 * createTime 创建时间
 * categories 分类
 */
let articleSchema = new Schema({
    name: {
        type: String,
        unique: true
	},
	categories: [{
		category: {
			type : ObjectId,
			ref : 'ArticleCategory'
		}
	}],
    describe: {
        type: String,
        default: ''
    },
	author : {
		type : ObjectId,
		ref : 'User'
    },
    likes :[{
		user : {
			type : ObjectId,
			ref : 'User'
		},
		time : {
			type : Number,
			default: new Date().getTime()
		}
	}],
	collections :[{
		user : {
			type : ObjectId,
			ref : 'User'
		},
		time : {
			type : Number,
			default: new Date().getTime()
		}
	}],
    browses :[{
		user : {
			type : ObjectId,
			ref : 'User'
		},
		time : {
			type : Number,
			default: new Date().getTime()
		}
	}],
    content : String,
    updateTime: {   
		type : Number,
		default : new Date().getTime()
	},
	createTime: {   
		type : Number,
		default : new Date().getTime()
	}
});

module.exports = mongoose.model('Article', articleSchema);