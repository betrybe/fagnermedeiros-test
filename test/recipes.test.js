const frisby = require('frisby');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const mongoDbUrl = 'mongodb://localhost:27017/Cookmaster';
const url = 'http://localhost:3000';

describe('3 - Crie um endpoint para o cadastro de receitas', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que não é possível cadastrar receita sem o campo "name"', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 400)
          .then((responseLogin) => {
            const { json } = responseLogin;
            expect(json.message).toBe('Invalid entries. Try again.');
          });
      });
  });

  it('Será validado que não é possível cadastrar receita sem o campo "preparation"', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Frango assado',
            ingredients: 'Frango',
          })
          .expect('status', 400)
          .then((responseLogin) => {
            const { json } = responseLogin;
            expect(json.message).toBe('Invalid entries. Try again.');
          });
      });
  });

  it('Será validado que não é possível cadastrar receita sem o campo "ingredients"', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Frango assado',
            preparation: '10 min no forno',
          })
          .expect('status', 400)
          .then((responseLogin) => {
            const { json } = responseLogin;
            expect(json.message).toBe('Invalid entries. Try again.');
          });
      });
  });

  it('Será validado que não é possível cadastrar uma receita com token invalido', async () => {
    await frisby
      .setup({
        request: {
          headers: {
            Authorization: '6437658488',
            'Content-Type': 'application/json',
          },
        },
      })
      .post(`${url}/recipes`, {
        name: 'Frango do jacquin',
        ingredients: 'Frango',
        preparation: '10 min no forno',
      })
      .expect('status', 401)
      .then((responseLogin) => {
        const { json } = responseLogin;
        expect(json.message).toBe('jwt malformed');
      });
  });

  it('Será validado que é possível cadastrar uma receita com sucesso', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Frango do jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseLogin) => {
            const { json } = responseLogin;
            expect(json.recipe).toHaveProperty('_id');
            expect(json.recipe.name).toBe('Frango do jacquin');
            expect(json.recipe.ingredients).toBe('Frango');
            expect(json.recipe.preparation).toBe('10 min no forno');
          });
      });
  });
});

describe('4 - Crie um endpoint para a listagem de receitas', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que é possível listar todas as receitas sem estar autenticado', async () => {
    await frisby
      .get(`${url}/recipes/`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result[0].name).toBe('banana caramelizada');
        expect(result[0].ingredients).toBe('banana, açúcar');
        expect(result[0].preparation).toBe(
          'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
        );
      });
  });

  it('Será validado que é possível listar todas as receitas estando autenticado', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201);
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/recipes/`)
          .expect('status', 200)
          .then((responseRecipes) => {
            const { json } = responseRecipes;
            expect(json[0].name).toBe('banana caramelizada');
            expect(json[0].ingredients).toBe('banana, açúcar');
            expect(json[0].preparation).toBe(
              'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
            );
            expect(json[1].name).toBe('Receita de frango do Jacquin');
            expect(json[1].ingredients).toBe('Frango');
            expect(json[1].preparation).toBe('10 min no forno');
          });
      });
  });
});

describe('5 - Crie um endpoint para visualizar uma receita específica', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que é possível listar uma receita específica sem estar autenticado', async () => {
    let resultRecipe;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipe) => {
            const { body } = responseRecipe;
            resultRecipe = JSON.parse(body);
          });
      });

    await frisby
      .get(`${url}/recipes/${resultRecipe.recipe._id}`)
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result).toHaveProperty('_id');
        expect(result.name).toBe('Receita de frango do Jacquin');
        expect(result.ingredients).toBe('Frango');
        expect(result.preparation).toBe('10 min no forno');
      });
  });

  it('Será validado que é possível listar uma receita específica estando autenticado', async () => {
    let resultRecipe;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipe) => {
            const { body } = responseRecipe;
            resultRecipe = JSON.parse(body);
          });
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/recipes/${resultRecipe.recipe._id}`)
          .expect('status', 200)
          .then((responseRecipes) => {
            const { json } = responseRecipes;
            expect(json).toHaveProperty('_id');
            expect(json.name).toBe('Receita de frango do Jacquin');
            expect(json.ingredients).toBe('Frango');
            expect(json.preparation).toBe('10 min no forno');
          });
      });
  });

  it('Será validado que não é possível listar uma receita que não existe', async () => {
    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201);
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .get(`${url}/recipes/999`)
          .expect('status', 404)
          .then((responseRecipes) => {
            const { json } = responseRecipes;
            expect(json.message).toBe('recipe not found');
          });
      });
  });
});

describe('7 - Crie um endpoint para a edição de uma receita', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que não é possível editar receita sem estar autenticado', async () => {
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .put(`${url}/recipes/${resultRecipes.recipe._id}`, {
        name: 'Receita de frango do Jacquin editado',
        ingredients: 'Frango editado',
        preparation: '10 min no forno editado',
      })
      .expect('status', 401)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result.message).toBe('missing auth token');
      });
  });

  it('Será validado que não é possível editar receita com token inválido', async () => {
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: '99999999',
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}`, {
        name: 'Receita de frango do Jacquin editado',
        ingredients: 'Frango editado',
        preparation: '10 min no forno editado',
      })
      .expect('status', 401)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result.message).toBe('jwt malformed');
      });
  });

  it('Será validado que é possível editar receita estando autenticado', async () => {
    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}`, {
        name: 'Receita de frango do Jacquin editado',
        ingredients: 'Frango editado',
        preparation: '10 min no forno editado',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('userId');
        expect(result.name).toBe('Receita de frango do Jacquin editado');
        expect(result.ingredients).toBe('Frango editado');
        expect(result.preparation).toBe('10 min no forno editado');
      });
  });

  it('Será validado que é possível editar receita com usuário admin', async () => {
    let resultRecipes;
    let resultAdmin;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'root@email.com',
        password: 'admin',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        resultAdmin = JSON.parse(body);
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: resultAdmin.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}`, {
        name: 'Receita de frango do Jacquin editado',
        ingredients: 'Frango editado',
        preparation: '10 min no forno editado',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('userId');
        expect(result.name).toBe('Receita de frango do Jacquin editado');
        expect(result.ingredients).toBe('Frango editado');
        expect(result.preparation).toBe('10 min no forno editado');
      });
  });
});

describe('8 - Crie um endpoint para a exclusão de uma receita', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que não é possível excluir receita sem estar autenticado', async () => {
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .delete(`${url}/recipes/${resultRecipes.recipe._id}`)
      .expect('status', 401)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        expect(result.message).toBe('missing auth token');
      });
  });

  it('Será validado que é possível excluir receita estando autenticado', async () => {
    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .delete(`${url}/recipes/${resultRecipes.recipe._id}`)
      .expect('status', 204);
  });

  it('Será validado que é possível excluir receita com usuário admin', async () => {
    let resultRecipes;
    let resultAdmin;

    await frisby
      .post(`${url}/login/`, {
        email: 'erickjacquin@gmail.com',
        password: '12345678',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        const result = JSON.parse(body);
        return frisby
          .setup({
            request: {
              headers: {
                Authorization: result.token,
                'Content-Type': 'application/json',
              },
            },
          })
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'root@email.com',
        password: 'admin',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        resultAdmin = JSON.parse(body);
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: resultAdmin.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .delete(`${url}/recipes/${resultRecipes.recipe._id}`)
      .expect('status', 204);
  });
});

describe('9 - Crie um endpoint para a adição de uma imagem a uma receita', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que é possível enviar foto com usuário autenticado', async () => {
    const photoFile = path.resolve(__dirname, '..', 'src', 'uploads', 'ratinho.jpg');
    const content = fs.createReadStream(photoFile);
    const formData = frisby.formData();

    formData.append('image', content);

    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}/image`, { body: formData })
      .expect('status', 200);
  });

  it('Será validado que ao enviar foto, o nome da imagem é alterada para o id da receita', async () => {
    const photoFile = path.resolve(__dirname, '../src/uploads/ratinho.jpg');
    const content = fs.createReadStream(photoFile);
    const formData = frisby.formData();

    formData.append('image', content);

    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}/image`, { body: formData })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        expect(result.image).toBe(`localhost:3000/src/uploads/${resultRecipes.recipe._id}.jpeg`);
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('userId');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('ingredients');
        expect(result).toHaveProperty('preparation');
      });
  });

  it('Será validado que não é possível enviar foto sem estar autenticado', async () => {
    const photoFile = path.resolve(__dirname, '../src/uploads/ratinho.jpg');
    const content = fs.createReadStream(photoFile);
    const formData = frisby.formData();

    formData.append('image', content);

    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .put(`${url}/recipes/${resultRecipes.recipe._id}/image`, { body: formData })
      .expect('status', 401);
  });

  it('Será validado que é possível enviar foto com usuário admin', async () => {
    const photoFile = path.resolve(__dirname, '../src/uploads/ratinho.jpg');
    const content = fs.createReadStream(photoFile);
    const formData = frisby.formData();

    formData.append('image', content);

    let result;
    let resultRecipes;
    let resultAdmin;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .post(`${url}/login/`, {
        email: 'root@email.com',
        password: 'admin',
      })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        resultAdmin = JSON.parse(body);
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: resultAdmin.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}/image`, { body: formData })
      .expect('status', 200)
      .then((response) => {
        const { body } = response;
        result = JSON.parse(body);
        expect(result.image).toBe(`localhost:3000/src/uploads/${resultRecipes.recipe._id}.jpeg`);
        expect(result).toHaveProperty('_id');
        expect(result).toHaveProperty('userId');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('ingredients');
        expect(result).toHaveProperty('preparation');
      });
  });
});

describe('10 - Crie um endpoint para acessar a imagem de uma receita', () => {
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
      {
        name: 'Erick Jacquin',
        email: 'erickjacquin@gmail.com',
        password: '12345678',
        role: 'user',
      },
    ];
    await db.collection('users').insertMany(users);
    const ListRecipes = [
      {
        name: 'banana caramelizada',
        ingredients: 'banana, açúcar',
        preparation: 'coloque o açúcar na frigideira até virar caramelo e jogue a banana',
      },
    ];
    await db.collection('recipes').insertMany(ListRecipes);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Será validado que é retornada uma imagem como resposta', async () => {
    const photoFile = path.resolve(__dirname, '../src/uploads/ratinho.jpg');
    const content = fs.createReadStream(photoFile);
    const formData = frisby.formData();

    formData.append('image', content);

    let result;
    let resultRecipes;

    await frisby
      .post(`${url}/login/`, {
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
          .post(`${url}/recipes`, {
            name: 'Receita de frango do Jacquin',
            ingredients: 'Frango',
            preparation: '10 min no forno',
          })
          .expect('status', 201)
          .then((responseRecipes) => {
            const { body } = responseRecipes;
            resultRecipes = JSON.parse(body);
          });
      });

    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json',
          },
        },
      })
      .put(`${url}/recipes/${resultRecipes.recipe._id}/image`, { body: formData })
      .expect('status', 200);


    await frisby
      .setup({
        request: {
          headers: {
            Authorization: result.token,
            'Content-Type': 'application/json'
          },
        },
      })
      .get(`${url}/images/${resultRecipes.recipe._id}.jpeg`)
      .expect('status', 200)
      .then((response) => {
        const { headers } = response;
        const symbol = Object.getOwnPropertySymbols(headers)[0]
        const contentType = headers[symbol]['content-type'][0]
        expect(contentType).toBe('image/jpeg')

      });
  });

});
