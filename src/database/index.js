const mongoose = require('mongoose');

mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`);