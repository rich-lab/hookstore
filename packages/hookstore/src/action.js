import { useContext, useDebugValue, useEffect } from 'react';
import invariant from 'invariant';

import { isPlainObject, compose, isPromise, isFunction, isString } from './util';
import { ContextMap, createCtx, getContextValue, doUpdate } from './context';
import { getState } from './stateRef';
import { ACTION_STATUS_NAMESPACE, DEFAULT_STATUS } from './statusModel';
// import { useSubscribe, publish } from './subscribe';
import { Middlewares } from './middlewares';

function createAction(namespace, action, handler) {
  // const context = createCtx(namespace, action);
  const applyAction = async (ctx, args) => {
    // return await handler.apply({ ctx }, args);
    const key = `${namespace}/${action}`;
    const prevStatus = getState(ACTION_STATUS_NAMESPACE)[key];
    // let ret = handler(ctx, ...args);
    let ret = handler.apply({ ctx }, args);

    if (isPromise(ret) && prevStatus) {
      const notify = getActions(ACTION_STATUS_NAMESPACE).set;

      notify(key, { pending: true, error: null });

      try {
        ret = await ret;
        notify(key, { pending: false, error: null });
      } catch (e) {
        notify(key, { error: e, pending: false });
        throw e;
      }
    }

    return ret;
  };
  const boundAction = async (...args) => {
    const ctx = createCtx(namespace, action);
    const middlewares = Middlewares.slice();
    // call middlewares by queue
    const ret = await compose(middlewares)(ctx, applyAction.bind(null, ctx, args));
    // update state
    doUpdate(namespace);

    return ret;
  };

  return boundAction;
}

export function createActions(namespace, actions) {
  invariant(isPlainObject(actions), `model[${namespace}].actions should be plain object!`);

  const newActions = {};

  Object.keys(actions).reduce((memo, action) => {
    const handler = actions[action];

    invariant(isFunction(handler), `model[${namespace}].actions[${action}] should be function!`);

    memo[action] = createAction(namespace, action, handler);

    return memo;
  }, newActions);

  return Object.freeze(newActions);
}

// access actions(call action out of Component is safe!)
export function getActions(namespace) {
  const context = getContextValue(namespace);

  return context.actions;
}

export function useStatus(actionWithNamespace) {
  invariant(
    actionWithNamespace && isString(actionWithNamespace),
    'You must pass [namespace/action] to useStatus()',
  );

  const Context = ContextMap.get(ACTION_STATUS_NAMESPACE);

  invariant(Context, 'Please ensure the component is wrapped in a <Provider>');

  useDebugValue(actionWithNamespace);

  const { state } = useContext(Context);

  // init async action status when call `useStatus`
  useEffect(() => {
    const refState = getState(ACTION_STATUS_NAMESPACE);

    if (!refState[actionWithNamespace]) {
      refState[actionWithNamespace] = DEFAULT_STATUS;
      // state[actionWithNamespace] = DEFAULT_STATUS;
      // getActions(ACTION_STATUS_NAMESPACE).set(actionWithNamespace, DEFAULT_STATUS);
    }
  }, [actionWithNamespace]);

  return state[actionWithNamespace] || {};
}
