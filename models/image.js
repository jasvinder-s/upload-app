var mongoose = require('mongoose');

//load up the user model
var User = require('../models/user');
		
var imageSchema = new mongoose.Schema({
	name: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Image', imageSchema);
