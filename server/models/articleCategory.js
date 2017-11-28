let mongoose = require('mongoose')
let Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
/**
 * name 文章分类名称 唯一
 * user 创建人
 * describe 描述
 * createTime 创建时间
 * articles 文章列表
 */
let articleCategorySchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    user : {
		type : ObjectId,
		ref : 'User'
    },
    describe: {
        type: String,
        default: ''
    },
    createTime: {
        type: Number,
        default: new Date().getTime()
    },
    articles: [{
        article: {
            type : ObjectId,
			ref : 'Article'
        }
    }]
});

module.exports = mongoose.model('ArticleCategory', articleCategorySchema);