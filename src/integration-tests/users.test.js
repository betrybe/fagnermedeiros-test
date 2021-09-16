const { join } = require('path');
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

describe('Create user', () => {
  before(done => {
    connect(`${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`)
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(async () => {
    Object.keys(connection.collections).forEach(async key => {
      await connection.collections[key].deleteMany({});
     });
  });

  after(done => {
    connection.close()
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should be able to create an user', (done) => {
    chai.request(app)
      .post('/users')
      .send({
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(201);
        expect(response.body.user).to.have.property('_id');
        done();
      })
      .catch((err) => done(err)); 
  });

  it('Should not be able to create a user with an email that already exists', (done) => {
    chai.request(app)
      .post('/users')
      .send({
        name: 'Test',
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(201);

        chai.request(app)
        .post('/users')
        .send({
          name: 'Test',
          email: 'test@test.com.br',
          password: '123456',
        })
        .then((response) => {
          expect(response).to.have.status(409);
          expect(response.body.message).to.equal('Email already registered');
          done();
        }).catch((err) => done(err));
      }).catch((err) => done(err));
  });

  it('Should not be able to create user without the name field', (done) => {
    chai.request(app)
      .post('/users')
      .send({
        email: 'test@test.com.br',
        password: '123456',
      })
      .then((response) => {
        expect(response).to.have.status(400);
        expect(response.body.message).to.equal('Invalid entries. Try again.');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not be able to create user without email field', () => {
    chai.request(app)
    .post('/users')
    .send({
      name: 'Test',
      password: '123456',
    })
    .then((response) => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.equal('Invalid entries. Try again.');
      done();
    })
    .catch((err) => done(err));
  });

  it('Should not be able to create user without password field', () => {
    chai.request(app)
    .post('/users')
    .send({
      name: 'Test',
      email: 'test@test.com.br',
    })
    .then((response) => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.equal('Invalid entries. Try again.');
      done();
    })
    .catch((err) => done(err));
  });

  it('Should not be able to create user with invalid email field', () => {
    chai.request(app)
    .post('/users')
    .send({
      name: 'Test',
      email: 'test',
      password: '123456',
    })
    .then((response) => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.equal('Invalid entries. Try again.');
      done();
    })
    .catch((err) => done(err));
  });
});
