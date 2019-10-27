// import { diff } from 'deep-diff';
import isEqual from 'lodash.isequal';
import clonedeep from 'lodash.clonedeep';
import invariant from 'invariant';

import { getState } from './stateRef';
import { isFunction, isPlainObject } from './util';

export const ContextMap = new Map();

// access Context
export function getContextValue(namespace) {
  const Context = ContextMap.get(namespace);

  invariant(
    Context,
    `model[${namespace}] has not created, please use <Provider model={model} /> first!`,
  );

  return Context._currentValue;
}

export function createCtx(namespace, action) {
  return Object.create({
    get namespace() {
      return namespace;
    },
    get action() {
      return action;
    },
    get state() {
      return getState(namespace);
    },
    get actions() {
      return getContextValue(namespace).actions;
    },
    getState(ns, selector) {
      // const sameNS = ns === namespace;
      if (isFunction(ns)) {
        selector = ns;
        ns = namespace;
      }

      // TODO:
      // state should be immutable if ns not current namespace

      return getState(ns || namespace, selector);
    },
    // frush state and make components re-render!
    flush() {
      // console.log(`${namespace}/${action} [flush]`);
      doUpdate(namespace);
    },
  });
}

// do update state
export function doUpdate(namespace) {
  // const prevState = getState(namespace);
  const { state, dispatch } = getContextValue(namespace);
  const latestState = getState(namespace);

  // TODO: state key check
  invariant(isPlainObject(latestState), 'state should be plain object!');

  // const hasChange = !equal(state, latestState);
  const changes = !isEqual(state, latestState);
  // console.log('---hasChange----->', state, latestState, changes);

  if (changes) {
    // console.log('update >>', namespace);
    // forceUpdate
    dispatch(clonedeep(latestState));
  }
}
