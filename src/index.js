import Router from './router/index.js';

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .listen();
