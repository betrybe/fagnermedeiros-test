const mongoose = require('mongoose');

const MONGO_DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'Cookmaster'; 

(async () => {
  await mongoose.connect(`${MONGO_DB_URL}/${DB_NAME}`)
.catch((err) => console.error(err));
})();
