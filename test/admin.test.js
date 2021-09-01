const frisby = require('frisby');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const mongoDbUrl = 'mongodb://localhost:27017/Cookmaster';
const url = 'http://localhost:3000';

describe('6 - Crie uma query em mongo que insira uma pessoa usuária com permissões de admin', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
    const users = [
      { name: 'admin', email: 'root@email.com', password: 'admin', role: 'admin' }
    ];
    await db.collection('users').insertMany(users);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que o projeto tem um arquivo de seed, com um comando para inserir um usuário root e verifico se consigo fazer login', async () => {
    const fileSeed = fs.readFileSync('./seed.js', 'utf8');
    expect(fileSeed).toContain('db.users.insertOne({ name: \'admin\', email: \'root@email.com\', password: \'admin\', role: \'admin\' });')
    await frisby
      .post(`${url}/login`,
        {
          email: 'root@email.com',
          password: 'admin',
        })
      .expect('status', 200)
      .then((responseLogin) => {
        const { json } = responseLogin;
        expect(json.token).not.toBeNull();
      });
  });
});

describe('12 - Crie um endpoint para cadastro de pessoas administradoras', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db('Cookmaster');
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
    await db.collection('recipes').deleteMany({});
    const users = [
      { name: 'admin', email: 'root@email.com', password: 'admin', role: 'admin' },
      { name: 'Erick Jacquin', email: 'erickjacquin@gmail.com', password: '12345678', role: 'user' },
    ];
    await db.collection('users').insertMany(users);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que não é possível cadastrar um usuário admin, sem estar autenticado como um usuário admin', async () => {
    let result;

    await frisby
      .post(`${url}/login/`,
        {
          email: 'erickjacquin@gmail.com',
          password: '12345678',
        })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/users/admin`,
            {
              name: 'usuario admin',
              email: 'usuarioadmin@email.com',
              password: 'admin',
            })
          .expect('status', 403)
          .then((responseAdmin) => {
            const { json } = responseAdmin;
            expect(json.message).toBe('Only admins can register new admins');
          });
      });
  });

  it('Será validado que é possível cadastrar um usuário admin', async () => {
    let result;

    await frisby
      .post(`${url}/login/`,
        {
          email: 'root@email.com',
          password: 'admin',
        })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/users/admin`,
            {
              name: 'usuario admin',
              email: 'usuarioadmin@email.com',
              password: 'admin',
            })
          .expect('status', 201)
          .then((responseAdmin) => {
            const { json } = responseAdmin;
            expect(json.user).toHaveProperty('_id');
            expect(json.user.name).toBe('usuario admin');
            expect(json.user.email).toBe('usuarioadmin@email.com');
            expect(json.user.role).toBe('admin');
          });
      });
  });
});
