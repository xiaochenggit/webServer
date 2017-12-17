const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
let ProjectCommentSchema = new Schema({
	project : {
		type : ObjectId,
		ref : 'Project'
	},
	from : {
		type : ObjectId,
		ref : 'User'
	},
	reply :[{
		from : {
			type : ObjectId,
			ref : 'User'
		},
		to : {
			type : ObjectId,
			ref : 'User',
		},
		content : String,
		createTime: {
			type : Number,
			default : new Date().getTime()
		}
	}],
	content : String,
	createTime: {   
		type : Number,
		default : new Date().getTime()
	}
});

module.exports = mongoose.model('ProjectComment', ProjectCommentSchema);