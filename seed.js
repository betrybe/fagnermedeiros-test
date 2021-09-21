const { MongoClient } = require('mongodb');

const mongoDbUrl = 'mongodb://localhost:27017/Cookmaster';

(async () => {
  connection = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = {
    users: connection.db('Cookmaster').collection('users'),
  }

  await db.users.insertOne({ name: 'admin', email: 'root@email.com', password: 'admin', role: 'admin' });

  process.exit();
})();
