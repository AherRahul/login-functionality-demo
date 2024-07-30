import { authRoutes } from './features/auth/routes/authRoutes';
import { Application } from 'express';
import { serverAdapter } from './shared/services/queues/base.queue';
import { currentUserRoutes } from './features/auth/routes/currentRoutes';
import { authMiddleware } from './shared/global/helpers/auth-middleware';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    // this is for GUI, to undarstand if there is any job fail
    app.use('/queues', serverAdapter.getRouter());

    // configuration for signout route
    app.use(BASE_PATH, authRoutes.signoutRoute());

    // authRoutes
    app.use(BASE_PATH, authRoutes.routes());

    // currentuser routes
    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  };

  routes();
};
