// import invariant from 'invariant';

import { checkMiddlewares } from './util';

export let Middlewares = [];

export function applyMiddlewares(middlewares = []) {
  checkMiddlewares(middlewares);

  // Middlewares = Middlewares.concat(middlewares);
  Middlewares = middlewares;
}
