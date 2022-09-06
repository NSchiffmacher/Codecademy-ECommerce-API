require('dotenv').config({path: __dirname + '/.env'})

const express = require('express');

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// ENV Variables
const PORT = process.env.PORT || 3000;

// Server creation
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

// Base routes
app.get('/', (req, res, next) => {
    res.send('Hello World');
})

// Server start
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}...`);
})