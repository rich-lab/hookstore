import React from 'react';
import invariant from 'invariant';

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

// get original store from Context
export function getContextValue(name) {
  const Context = getContext(name);

  invariant(
    Context,
    `store[${name}] has not created yield, please use <Provider model={model} /> as parent component first!`,
  );

  return Context._currentValue;
}

// access store outside component
export function getStore(name, selector) {
  const store = getContextValue(name);
  const { getState, actions } = store;
  const value = getState(selector);

  // return a tuple as useStore()
  return [value, actions];
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
      return getStore(name)[0];
    },
    // get current actions map
    get actions() {
      return getContextValue(name).actions;
    },
    // access other store
    getStore(modelName, selector) {
      if (isFunction(modelName)) {
        selector = modelName;
        modelName = name;
      }

      return getStore(modelName || name, selector);
    },
    // fresh state changes right now!
    fresh(msg) {
      if (msg) console.log(`[fresh] ${name}/${action}`, msg);
      doUpdate(name);
    },
  };
}

// do update state
export function doUpdate(name, actionOrActionWithName) {
  if (name !== ASN) getContextValue(name).notify();
  else getContextValue(ASN).notify(actionOrActionWithName);
}
