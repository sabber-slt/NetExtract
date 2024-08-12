import express, { Express } from 'express';
import cors from 'cors';
import logger from './utils/logger';
import routes from './routes';

const createServer = (): Express => {
  const app = express();
  return app;
};

const setupMiddleware = (app: Express): void => {
  const corsOptions = {
    origin: '*',
  };
  app.use(cors(corsOptions));
  app.use(express.json());
};

const setupRoutes = (app: Express): void => {
  app.use('/api', routes);
};

const startServer = (app: Express, port: number): void => {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
};

const main = (): void => {
  const port = 3000;
  const app = createServer();
  setupMiddleware(app);
  setupRoutes(app);
  startServer(app, port);
};

main();
