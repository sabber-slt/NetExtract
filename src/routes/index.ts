import { Router } from 'express';
import webRouter from './web';
import imageRouter from './image';
import xRouter from './twitter';

const ROUTES = {
  WEB: '/web',
  IMAGE: '/image',
  X: '/x',
} as const;

const mainRouter: Router = Router();

mainRouter.use(ROUTES.WEB, webRouter);
mainRouter.use(ROUTES.IMAGE, imageRouter);
mainRouter.use(ROUTES.X, xRouter);

export default mainRouter;
