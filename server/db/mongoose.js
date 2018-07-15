let mongoose = require('mongoose');

mongoose.Promise = global.Promise;    //versus BlueBird Promise
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
