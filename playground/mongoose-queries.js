const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

let id = '5b4ba3c539fdab103e6ab86a11';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }
//
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });
//
// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('ID not found');
//   }
//   console.log('Todo by id', todo);
// }).catch((e) => console.log(e));
