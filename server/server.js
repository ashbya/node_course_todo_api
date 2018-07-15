const express = require('express');
const bodyParser = require('body-parser');

var {mangoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

let app = express();
//app.use(bodyParser.json());
app.use(express.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) =>{
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
  //console.log(req.body);
});

app.listen(3000, () => {
  console.log('Started on port 3000');
})
