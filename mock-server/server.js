const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';
const jsonServer = require('json-server');
const cors = require('cors');
const app = jsonServer.create();
const router = require('./lowdb').getRouter();
const middlewares = jsonServer.defaults(isProduction ? {static: './dist/ng-material/browser'} : {});

const delayMiddleware = require('./middlewares/delay');
const errosMiddleware = require('./middlewares/errors');

const blocks = require('./controllers/blocks');
const instances = require('./controllers/instances');

// set the port of our application
// process.env.PORT lets the port to be set by Heroku
const port = process.env.PORT || 3000;

// Middlewares
app.use(middlewares);
app.use(delayMiddleware.delay);
app.use(errosMiddleware.error);

// To handle POST, PUT and PATCH you need to use a body-parser
app.use(jsonServer.bodyParser);

// Expose relevant headers
app.use(cors({exposedHeaders: ['X-Total-Count']}));

app.get(`${isProduction ? '/api' : ''}/instances`, instances.getInstances);
app.get(`${isProduction ? '/api' : ''}/blocks`, blocks.getBlocks);
app.put(`${isProduction ? '/api' : ''}/blocks`, blocks.saveBlocks);

// Mount the router based on lowdb.js
app.use(isProduction ? '/api' : '/', router);

// Fallback on frontend routes
app.get('*', (req, res, next) => {
  // load index.html (frontend will handle page changes)
  isProduction ? res.sendFile(path.join(__dirname, '../dist/ng-material/browser/index.html')) : next();
});

// Start listening
app.listen(port, () => {
  console.log(`JSON Server is running! Open the browser at http://localhost:${port}`);
});
