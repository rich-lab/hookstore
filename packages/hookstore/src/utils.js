import { useReducer, useEffect, useLayoutEffect } from 'react';
import invariant from 'invariant';
import isPlainObject from 'is-plain-object';

export { isPlainObject };

export const isString = str => typeof str === 'string';
export const isFunction = fn => typeof fn === 'function';
// export const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
export const isPromise = obj => obj instanceof Promise && isFunction(obj.then);

// @see https://github.com/koajs/compose/
export function compose(funcs) {
  invariant(Array.isArray(funcs), 'Middleware stack must be an array!');

  funcs.forEach(fn => {
    invariant(isFunction(fn), 'Middleware must be composed of functions!');
  });

  return (ctx, next) => {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));

      index = i;

      let fn = funcs[i];

      if (i === funcs.length) fn = next;

      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

export function checkModels(props = {}) {
  const { model, models } = props;

  invariant(model || models, 'Provider props `model` or `models` required!');

  if (models) {
    invariant(Array.isArray(models), 'models should be array!');
    invariant(models.length >= 1, 'should provide at last one model!');

    // for (const m of models) checkModel(m);
    for (let i = 0; i < models.length; i++) {
      checkModel(models[i]);
    }

    return;
  }

  checkModel(model);
}

function checkModel(model) {
  invariant(isPlainObject(model), 'model should be plain object!');

  const { name, state, actions /* , middlewares */ } = model;

  invariant(name, 'model name is required!');
  invariant(typeof name === 'string', 'model name should be string!');

  if (state) invariant(isPlainObject(state), 'model state should be plain object!');

  if (actions) invariant(isPlainObject(actions), `model actions should be plain object!`);

  // if (middlewares) checkMiddlewares(middlewares);
}

export function checkMiddlewares(middlewares) {
  invariant(Array.isArray(middlewares), 'typeof middlewares should be array!');
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useForceRender() {
  return useReducer(c => c + 1, 0)[1];
}

export function tryClone(value) {
  if (isPlainObject(value)) return JSON.parse(JSON.stringify(value));
  if (Array.isArray(value)) return value.slice();

  return value;
}

const hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  }

  return x !== x && y !== y;
}

// copy from react-redux
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
