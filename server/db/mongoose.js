let mongoose = require('mongoose');

mongoose.Promise = global.Promise;    //versus BlueBird Promise
mongoose.connect(process.env.MONGOD_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
