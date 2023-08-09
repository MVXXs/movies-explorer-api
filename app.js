const express = require('express');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');
const corsConfig = require('./middlewares/cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, MONGO_URL = 'mongodb://0.0.0.0:27017' } = process.env;

mongoose.connect(`${MONGO_URL}/bitfilmsdb`, {
  useNewUrlParser: true,
});

const app = express();

app.use(bodyParser.json());
app.use(corsConfig);

app.use(requestLogger);

app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT);
