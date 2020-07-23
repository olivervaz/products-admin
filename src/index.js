import Router from './router/index.js';

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^products$/, 'products')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .listen();
