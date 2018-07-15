const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Insert seed Todos for automated testing
const seed_todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(seed_todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text'

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) { return done(err); }
         Todo.find({text}).then((todos) => {
           expect(todos.length).toBe(1);
           expect(todos[0].text).toBe(text);
           done();
         }).catch((e) => done(e));
      })
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        //Fetch from database
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
         }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${seed_todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(seed_todos[0].text);
        })
        .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let wrongID = new ObjectID().toHexString();

    // wrong_id = wrong_id + 1;
    // console.log(wrong_id);
    //
    request(app)
      .get(`/todos/${wrongID}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    //todos/123
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  })
});
