const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {seed_todos, populateTodos, seed_users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text'

    request(app)
      .post('/todos')
      .set('x-auth', seed_users[0].tokens[0].token)
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
      .set('x-auth', seed_users[0].tokens[0].token)
      .send({})
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
      .set('x-auth', seed_users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${seed_todos[0]._id.toHexString()}`)
        .set('x-auth', seed_users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(seed_todos[0].text);
        })
        .end(done);
  });

  it('should not return todo doc from a different user', (done) => {
      request(app)
        .get(`/todos/${seed_todos[1]._id.toHexString()}`)
        .set('x-auth', seed_users[0].tokens[0].token)
        .expect(404)
        .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let wrongID = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${wrongID}`)
      .set('x-auth', seed_users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    //todos/123
    request(app)
      .get('/todos/123')
      .set('x-auth', seed_users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexID = seed_todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', seed_users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexID).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });

  });

  it('should not remove a todo from a differnt user', (done) => {
    let hexID = seed_todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', seed_users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexID).then((todo) => {
          expect(todo).toExist();
          done();
        }).catch((e) => done(e));
      });

  });

  it('should return 404 if todo not found', (done) => {
    let wrongID = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${wrongID}`)
      .set('x-auth', seed_users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if ObjectID is invalid', (done) => {
    //todos/123
    request(app)
      .delete('/todos/123')
      .set('x-auth', seed_users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todo/:id', () => {
  it('should update the todo', (done) => {
    var hexID = seed_todos[0]._id.toHexString();
    var text = 'Dummy text';

    request(app)
      .patch(`/todos/${hexID}`)
      .set('x-auth', seed_users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        //expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should not update the todo of a different user', (done) => {
    var hexID = seed_todos[0]._id.toHexString();
    var text = 'Dummy text';

    request(app)
      .patch(`/todos/${hexID}`)
      .set('x-auth', seed_users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(400)
      .end(done);
  });

  it('should clear completeAt when todo is not completed', (done) => {
    var hexID = seed_todos[1]._id.toHexString();
    var text = 'Dummy text 2';

    request(app)
      .patch(`/todos/${hexID}`)
      .set('x-auth', seed_users[0].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .set('x-auth', seed_users[1].tokens[0].token)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', seed_users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(seed_users[0]._id.toHexString());
        expect(res.body.email).toBe(seed_users[0].email);
      })
      .end(done);
  });

  it('should return a 404 if not authenticated', (done) =>{
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
});

describe('POST /users', () => {
  it('should create a user', (done) =>{
    let email = 'example@example.com';
    let password = '123asd';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) =>{
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toExist(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email}).then((user) =>{
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    let email = 'example.com';
    let password = '123asd';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);

  });

  it('should not create user if email in use', (done) =>{
    let email = seed_users[0].email;
    let password = '123asd';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);

  });
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: seed_users[1].email,
        password: seed_users[1].password
      })
      .expect(200)
      .expect((res) =>{
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) { return done(err); }

        User.findById(seed_users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });  // closing it should login user and return auth token

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: seed_users[1].email,
        password: 'nope'
      })
      .expect(400)
      .expect((res) =>{
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) { return done(err); }

        User.findById(seed_users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
    });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', seed_users[0].tokens[0].token)
      .expect(200)
      .end((err, res) =>{
        if (err) { return done(err); }
        User.findById(seed_users[0]._id).then((user) =>{
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
