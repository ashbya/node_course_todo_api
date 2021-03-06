let mongoose = require('mongoose');

mongoose.Promise = global.Promise;    //versus BlueBird Promise
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

module.exports = {mongoose};
