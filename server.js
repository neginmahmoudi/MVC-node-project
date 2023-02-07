require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());
//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// routes
app.use('/', require('./routes/root'));
app.use('/employees', require('./routes/api/employees'));

// app.get('^/$|/index(.html)?', (req, res) => {
//   // res.sendFile('./views/index.html', { root: __dirname });
//   res.sendFile(path.join(__dirname, 'views', 'index.html'));
// });
// app.get('/new-page(.html)?', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
// });

// app.get('/old-page(.html)?', (req, res) => {
//   res.redirect(301, 'index.html'); //302 by default
// });
// // Route handlers
// app.get(
//   '/hello(.html)?',
//   (req, res, next) => {
//     console.log('attempted to run the file');
//     next();
//   },
//   (req, res) => {
//     res.send('hello world!');
//   },
// );

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
