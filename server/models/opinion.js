const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
let opinionSchema = new Schema({
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

module.exports = mongoose.model('Opinion', opinionSchema);