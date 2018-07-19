const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const seed_users = [{
  _id: userOneId,
  email: 'froggy@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'bb@example.com',
  password: 'userTwoPass'
}];

// Insert seed Todos for automated testing
const seed_todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 33
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(seed_todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(seed_users[0]).save();
    let userTwo = new User(seed_users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {seed_todos, populateTodos, seed_users, populateUsers};
