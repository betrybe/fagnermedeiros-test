const mongoose = require('mongoose');

const MONGO_DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'Cookmaster'; 

mongoose.connect(`${MONGO_DB_URL}/${DB_NAME}`);