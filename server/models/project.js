const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
/**
 * name 项目名称
 * type 类型
 * budget 预算
 * schedule 完成进度
 * time 期望交付日期
 * concat 联系方式
 * user 发布人
 * content 内容
 * careUsers 收藏者
 * endUser 结单人
 * updateTime 更新时间
 * createTime 创建时间
 * isOverdue 是否过期
 */
let projectSchema = new Schema({
    name: {
        type: String
	},
	type: {
		type: String
	},
    budget: {
        type: Number
    },
    schedule: {
    	type: String
    },
    time: {
    	type: Number,
    	default: new Date().getTime()
    },
    concat: {
    	type: String
    },
	user: {
		type : ObjectId,
		ref : 'User'
    },
    isOverdue: {
        type: Boolean,
        default: false
    },
    careUsers: [{
        user: {
            type : ObjectId,
            ref : 'User'
        },
        time: {
            type: Number,
            default: new Date().getTime()
        }
    }],
    content : String,
    endUser: {
    	type : ObjectId,
		ref : 'User'
    },
    updateTime: {   
		type : Number,
		default : new Date().getTime()
	},
	createTime: {   
		type : Number,
		default : new Date().getTime()
	}
});

module.exports = mongoose.model('Project', projectSchema);