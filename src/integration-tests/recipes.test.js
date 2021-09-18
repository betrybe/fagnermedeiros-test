const fs = require('fs');
const { join, resolve } = require('path');
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { connection, connect } = require('mongoose');

require('dotenv').config({
  path: join(__dirname, '..', '..', '.env.test'),
});

const app = require('../api/app');

chai.should();
chai.use(chaiHttp);

const MONGO_DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'Cookmaster';

describe('Create recipe', () => {
  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
     });

     await connection.collection('users').insertOne({
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
     });
  });

  after(done => {
    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to create an recipe', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .post('/recipes')
          .set('Authorization', response.body.token)
          .send({
            name: 'Omelet',
            ingredients: '3 eggs, 3 spoons of milk',
            preparation: '10 minutes',
          })
          .then((response) => {
            expect(response).to.have.status(201);
            expect(response.body.recipe).to.have.property('_id');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should not be able to create a recipe without being authenticated', (done) => {
    chai.request(app)
      .post('/recipes')
      .send({
        ingredients: '3 eggs, 3 spoons of milk',
        preparation: '10 minutes',
      })
      .then((response) => {
        expect(response).to.have.status(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('missing auth token');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not be able to create recipe without name field', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .post('/recipes')
          .set('Authorization', response.body.token)
          .send({
            ingredients: '3 eggs, 3 spoons of milk',
            preparation: '10 minutes',
          })
          .then((response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid entries. Try again.');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
});

  it('Should not be able to create recipe without ingredients field', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .post('/recipes')
          .set('Authorization', response.body.token)
          .send({
            name: 'Omelet',
            preparation: '10 minutes',
          })
          .then((response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid entries. Try again.');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should not be able to create recipe without preparation field', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .post('/recipes')
          .set('Authorization', response.body.token)
          .send({
            name: 'Omelet',
            ingredients: '3 eggs, 3 spoons of milk',
          })
          .then((response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Invalid entries. Try again.');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

describe('List recipes', () => {
  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    await connection.collection('users').insertOne({
      name: 'Test',
      email: 'test@test.com.br',
      password: '123456',
    });

    await connection.collection('recipes').insertMany([
      {
        name: 'Omelet',
        ingredients: '3 eggs, 3 spoons of milk',
        preparation: '10 minutes',
      }
    ]);
  });

  after(done => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to list all recipes', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .get('/recipes')
          .set('Authorization', response.body.token)
          .then((response) => {
            const [recipe] = response.body;

            expect(response).to.have.status(200);
            expect(response.body).to.have.a('array');
            expect(recipe).to.have.property('_id');
            expect(recipe.name).to.have.equal('Omelet');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should be able to list all recipes without being authenticated', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .get('/recipes')
          .then((response) => {
            const [recipe] = response.body;

            expect(response).to.have.status(200);
            expect(response.body).to.have.a('array');
            expect(recipe).to.have.property('_id');
            expect(recipe.name).to.have.equal('Omelet');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

describe('Show recipe', () => {
  let recipeId;

  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    await connection.collection('users').insertOne({
      name: 'Test',
      email: 'test@test.com.br',
      password: '123456',
    });

    await connection.collection('recipes').insertOne({
      name: 'Omelet',
      ingredients: '3 eggs, 3 spoons of milk',
      preparation: '10 minutes',
    });

    const { _id } = await connection.collection('recipes').findOne({ name: 'Omelet' });
    recipeId = _id;
  });

  after(done => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to view a specific recipe', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .get(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .then((response) => {
            const recipe = response.body;

            expect(response).to.have.status(200);
            expect(recipe).to.have.a('object');
            expect(recipe).to.have.property('_id');
            expect(recipe.name).to.have.equal('Omelet');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should not be able to view a recipe that does not exists', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .get(`/recipes/999999`)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(404);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('recipe not found');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

describe('Update recipe', () => {
  let recipeId;

  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    await connection.collection('users').insertMany([
      {
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
        role: 'user',
      },
      {
        name: 'Admin',
        email: 'admin@test.com.br',
        password: 'admin',
        role: 'admin',
      },
      {
        name: 'Test 2',
        email: 'test2@test.com.br',
        password: '123456',
        role: 'user',
      },
    ]);

    const { _id: userId } = await connection.collection('users').findOne({
      email: 'test@test.com.br',
    });

    await connection.collection('recipes').insertOne({
      name: 'Omelet',
      ingredients: '3 eggs, 3 spoons of milk',
      preparation: '10 minutes',
      userId,
    });

    const { _id } = await connection.collection('recipes').findOne({ name: 'Omelet' });
    recipeId = _id;
  });

  after(done => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to update an recipe', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .send({
            name: 'Edited omelet',
            ingredients: 'Edited ingredients',
            preparation: 'Edited preparation',
          })
          .then((response) => {
            const recipe = response.body;

            expect(response).to.have.status(200);
            expect(recipe.name).to.equal('Edited omelet');
            expect(recipe.ingredients).to.equal('Edited ingredients');
            expect(recipe.preparation).to.equal('Edited preparation');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should not be able to update a recipe without being authenticated', (done) => {    
    chai.request(app)
      .put(`/recipes/${recipeId}`)
      .send({
        name: 'Edited omelet',
        ingredients: 'Edited ingredients',
        preparation: 'Edited preparation',
      })
      .then((response) => {
        expect(response).to.have.status(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('missing auth token');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not be able to update a recipe with invalid token', (done) => {    
    chai.request(app)
      .put(`/recipes/${recipeId}`)
      .set('Authorization', 'invalid-token')
      .send({
        name: 'Edited omelet',
        ingredients: 'Edited ingredients',
        preparation: 'Edited preparation',
      })
      .then((response) => {
        expect(response).to.have.status(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('jwt malformed');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should be able to update a recipe with admin user', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'admin@test.com.br',
        password: 'admin',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .send({
            name: 'Edited omelet',
            ingredients: 'Edited ingredients',
            preparation: 'Edited preparation',
          })
          .then((response) => {
            const recipe = response.body;

            expect(response).to.have.status(200);
            expect(recipe.name).to.equal('Edited omelet');
            expect(recipe.ingredients).to.equal('Edited ingredients');
            expect(recipe.preparation).to.equal('Edited preparation');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('should not be able to update another users recipe without having admin permission', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test2@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .send({
            name: 'Edited omelet',
            ingredients: 'Edited ingredients',
            preparation: 'Edited preparation',
          })
          .then((response) => {
            expect(response).to.have.status(401);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User does not have permission');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

describe('Delete recipe', () => {
  let recipeId;

  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    await connection.collection('users').insertMany([
      {
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
        role: 'user',
      },
      {
        name: 'Admin',
        email: 'admin@test.com.br',
        password: 'admin',
        role: 'admin',
      },
      {
        name: 'Test 2',
        email: 'test2@test.com.br',
        password: '123456',
        role: 'user',
      },
    ]);

    const { _id: userId } = await connection.collection('users').findOne({
      email: 'test@test.com.br',
    });

    await connection.collection('recipes').insertOne({
      name: 'Omelet',
      ingredients: '3 eggs, 3 spoons of milk',
      preparation: '10 minutes',
      userId,
    });

    const { _id } = await connection.collection('recipes').findOne({ name: 'Omelet' });
    recipeId = _id;
  });

  after(done => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to delete an recipe being authenticated', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .delete(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(204);
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should not be able to delete an recipe without being authenticated', (done) => {    
    chai.request(app)
      .delete(`/recipes/${recipeId}`)
      .then((response) => {
        expect(response).to.have.status(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('missing auth token');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should able to delete an recipe with admin permission', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'admin@test.com.br',
        password: 'admin',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .delete(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(204);
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should able to delete an recipe another user without admin permission', (done) => {    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test2@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .delete(`/recipes/${recipeId}`)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(401);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User does not have permission');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

describe('Create image in recipe', () => {
  let recipeId;

  before(done => {
    connect(`${MONGO_DB_URL}/${DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    await connection.collection('users').insertMany([
      {
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
        role: 'user',
      },
      {
        name: 'Admin',
        email: 'admin@test.com.br',
        password: 'admin',
        role: 'admin',
      },
      {
        name: 'Test 2',
        email: 'test2@test.com.br',
        password: '123456',
        role: 'user',
      },
    ]);

    const { _id: userId } = await connection.collection('users').findOne({
      email: 'test@test.com.br',
    });

    await connection.collection('recipes').insertOne({
      name: 'Omelet',
      ingredients: '3 eggs, 3 spoons of milk',
      preparation: '10 minutes',
      userId,
    });

    const { _id } = await connection.collection('recipes').findOne({ name: 'Omelet' });
    recipeId = _id;
  });

  after(done => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
    });

    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to create image an recipe being authenticated', (done) => {
    const imageFile = resolve(__dirname, '..', 'uploads', 'ratinho.jpg');
    const iamgeStream =  fs.createReadStream(imageFile);
    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}/image`)
          .attach('image', iamgeStream)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(200);
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('Should be able to create image an recipe being authenticated', (done) => {
    chai.request(app)
      .put(`/recipes/${recipeId}/image`)
      .then((response) => {
        expect(response).to.have.status(401);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('missing auth token');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should be able to create image an recipe with admin permission', (done) => {
    const imageFile = resolve(__dirname, '..', 'uploads', 'ratinho.jpg');
    const iamgeStream =  fs.createReadStream(imageFile);
    
    chai.request(app)
      .post('/login')
      .send({
        email: 'admin@test.com.br',
        password: 'admin',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}/image`)
          .attach('image', iamgeStream)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(200);
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });

  it('should not be able to create an image in another users recipe without admin permission', (done) => {
    const imageFile = resolve(__dirname, '..', 'uploads', 'ratinho.jpg');
    const iamgeStream =  fs.createReadStream(imageFile);
    
    chai.request(app)
      .post('/login')
      .send({
        email: 'test2@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('token');

        chai.request(app)
          .put(`/recipes/${recipeId}/image`)
          .attach('image', iamgeStream)
          .set('Authorization', response.body.token)
          .then((response) => {
            expect(response).to.have.status(401);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('User does not have permission');
            done();
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  });
});

