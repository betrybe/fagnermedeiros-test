const { MongoClient } = require('mongodb');

const mongoDbUrl = 'mongodb://localhost:27017/Cookmaster';

(async () => {
  connection = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = connection.db('Cookmaster');

  await db.collection('users').insertOne({
    name: 'admin',
    email: 'root@email.com',
    password: '123456',
    role: 'admin',
  });

  process.exit();
})();
