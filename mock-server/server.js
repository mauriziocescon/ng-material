import path from 'path';
import cors from 'cors';
import jsonServer from 'json-server';
import {getRouter} from './lowdb.js';

import {delay} from './middlewares/delay.js';
import {error} from './middlewares/errors.js';

// routes
import * as blocks from './routes/blocks.js';
import * as instances from './routes/instances.js';

const isProduction = process.env.NODE_ENV === 'production';

const app = jsonServer.create();
const router = getRouter();
const middlewares = jsonServer.defaults(isProduction ? {static: './dist/ng-material/browser'} : {});

// set the port of our application
// process.env.PORT lets the port to be set by Heroku
const port = process.env.PORT || 3000;

// Middlewares
app.use(middlewares);
app.use(delay);
app.use(error);

// To handle POST, PUT and PATCH you need to use a body-parser
app.use(jsonServer.bodyParser);

// Expose relevant headers
app.use(cors({exposedHeaders: ['X-Total-Count']}));

// Mount routes
app.use(`${isProduction ? '/api' : '/'}`, instances.router);
app.use(`${isProduction ? '/api' : '/'}`, blocks.router);
app.use(`${isProduction ? '/api' : '/'}`, router);

// Fallback on frontend routes
app.get('*', (req, res, next) => {
  // load index.html (frontend will handle page changes)
  isProduction ? res.sendFile(path.join(__dirname, '../dist/ng-material/browser/index.html')) : next();
});

// Start listening
app.listen(port, () => {
  console.log(`JSON Server is running! Open the browser at http://localhost:${port}`);
});
