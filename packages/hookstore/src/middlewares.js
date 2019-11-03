// import invariant from 'invariant';

import { checkMiddlewares } from './utils';

export let Middlewares = [];

export function applyMiddlewares(middlewares = []) {
  checkMiddlewares(middlewares);

  // Middlewares = Middlewares.concat(middlewares);
  Middlewares = middlewares;
}
