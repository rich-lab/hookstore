import React from 'react';
import invariant from 'invariant';

import { getStore } from './store';
import { ACTION_STATUS_NAME as ASN } from './statusModel';
import { isFunction } from './utils';

const ContextMap = new Map();

export function getContext(name) {
  return ContextMap.get(name) || null;
}

export function createContext(name, store) {
  const Context = React.createContext(store);

  Context.displayName = name;
  ContextMap.set(name, Context);

  return Context;
}

export function deleteContext(name) {
  return ContextMap.delete(name);
}

// get store
export function getContextValue(name) {
  const Context = getContext(name);

  invariant(
    Context,
    `store[${name}] has not created yield, please use <Provider model={model} /> as parent component first!`,
  );

  return Context._currentValue;
}

export function createCtx(name, action) {
  return {
    // get model name
    get name() {
      return name;
    },
    // get action name
    get action() {
      return action;
    },
    // get current state
    get state() {
      // return getStore(name).getState();
      return getStore(name)[0];
    },
    // get current actions map
    get actions() {
      return getContextValue(name).actions;
      // return getStore(name)[1];
    },
    getStore(modelName, selector) {
      if (isFunction(modelName)) {
        selector = modelName;
        modelName = name;
      }

      return getStore(modelName || name, selector);
    },
    // frush state and make components re-render!
    flush(msg) {
      if (msg) console.log(`[flush] ${name}/${action}`, msg);
      doUpdate(name);
    },
  };
}

// do update state
export function doUpdate(name, actionOrActionWithName) {
  if (name !== ASN) getContextValue(name).notify();
  else getContextValue(ASN).notify(actionOrActionWithName);
}
