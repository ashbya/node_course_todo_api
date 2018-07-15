var mongoose = require('mongoose');

// User model
// email property - required and trim , type String, set min length of 1
let User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  }
});

module.exports = {User};
