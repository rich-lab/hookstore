// import invariant from 'invariant';

import { createActions } from './action';
import { getContextValue } from './context';
import { ACTION_STATUS_NAME as ASN, actionStatusModel } from './statusModel';
import { isFunction } from './utils';

const SubscriptionMap = new Map();
const SubscriptionStatusMap = new Map();

function select(state, selector) {
  const currentState = state;
  const selected = isFunction(selector) ? selector(currentState) : currentState;

  return selected;
}

export function createStore(model) {
  const { name, state = {}, actions = {} } = model;

  if (name === ASN) return createStatusStore();

  let subscriptions = SubscriptionMap.get(name);

  if (!subscriptions) {
    subscriptions = SubscriptionMap.set(name, []).get(name);
  }

  function subscribe(listener) {
    subscriptions.unshift(listener);

    return () => {
      subscriptions.splice(subscriptions.indexOf(listener), 1);
    };
  }

  function notify() {
    const listeners = subscriptions.slice();
    // const latestState = select(state);

    for (let i = 0; i < listeners.length; i++) {
      listeners[i](state);
    }
  }

  return {
    // name,
    getState: selector => select(state, selector),
    actions: createActions(name, actions),
    subscribe,
    notify,
  };
}

function createStatusStore() {
  const { name, state = {}, actions = {} } = actionStatusModel;
  let subscriptionStatus = SubscriptionStatusMap.get(ASN);

  if (!subscriptionStatus) {
    subscriptionStatus = SubscriptionStatusMap.set(ASN, {}).get(ASN);
  }

  function subscribe(actionWithName, listener) {
    let subscriptions = subscriptionStatus[actionWithName];

    if (!subscriptions) {
      subscriptions = subscriptionStatus[actionWithName] = [];
    }

    subscriptions.unshift(listener);

    return () => {
      subscriptions.splice(subscriptions.indexOf(listener), 1);
    };
  }

  function notify(actionWithName) {
    const subscriptions = subscriptionStatus[actionWithName] || [];
    const listeners = subscriptions.slice();
    // const state = select();

    for (let i = 0; i < listeners.length; i++) {
      listeners[i](state);
    }
  }

  return {
    getState: selector => select(state, selector),
    actions: createActions(name, actions),
    subscribe,
    notify,
  };
}

// access store outside component
export function getStore(name, selector) {
  const store = getContextValue(name);
  const { getState, actions } = store;
  const value = getState(selector);

  // return a tuple as useStore()
  return [value, actions];
}
