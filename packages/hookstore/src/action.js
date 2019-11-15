import { useContext, useDebugValue, useRef } from 'react';
import invariant from 'invariant';

import {
  isPlainObject,
  compose,
  isPromise,
  isFunction,
  isString,
  useIsomorphicLayoutEffect,
  useForceRender,
} from './utils';
import { createCtx, doUpdate, getContext, getStore } from './context';
import { ACTION_STATUS_NAME as ASN, DEFAULT_STATUS } from './statusModel';
import { Middlewares } from './middlewares';

function createAction(name, action, handler) {
  // const context = createCtx(name, action);
  async function applyAction(ctx, args) {
    // return await handler.apply({ ctx }, args);
    const actionWithName = `${name}/${action}`;
    const [prevStatus, actions] = getStore(ASN, s => s[actionWithName]);
    // let ret = handler(ctx, ...args);
    let ret = handler.apply({ ctx }, args);

    if (prevStatus) {
      if (isPromise(ret)) {
        const setStatus = actions.set;

        setStatus(actionWithName, { pending: true, error: null });

        try {
          ret = await ret;
          setStatus(actionWithName, { pending: false, error: null });
        } catch (e) {
          setStatus(actionWithName, { error: e, pending: false });
          throw e;
        }
      } else {
        console.warn(`It's no need to add listener(s) for asynchronous action: ${actionWithName}`);
      }
    }

    return ret;
  }

  return async function boundAction(...args) {
    const ctx = createCtx(name, action);
    const middlewares = Middlewares.slice();
    // call middlewares by queue
    const ret = await compose(middlewares)(ctx, applyAction.bind(null, ctx, args));
    // update state
    if (name !== ASN) doUpdate(name);
    else doUpdate(ASN, args[0]);

    return ret;
  };
}

export function createActions(name, actions) {
  invariant(isPlainObject(actions), `model[${name}].actions should be plain object!`);

  const newActions = {};

  Object.keys(actions).reduce((memo, action) => {
    const handler = actions[action];

    invariant(isFunction(handler), `model[${name}].actions[${action}] should be function!`);

    memo[action] = createAction(name, action, handler);

    return memo;
  }, newActions);

  return Object.freeze(newActions);
}

export function useStatus(actionWithName) {
  invariant(
    actionWithName && isString(actionWithName),
    'You must pass [name/action] to useStatus()',
  );

  const Context = getContext(ASN);

  invariant(Context, 'Please ensure the component is wrapped in a <Provider>');

  useDebugValue(actionWithName);

  const forceRender = useForceRender();
  const store = useContext(Context);
  const status = store.getState(s => s[actionWithName] || {});
  const statusRef = useRef(status);

  useIsomorphicLayoutEffect(() => {
    statusRef.current = status;
  });

  useIsomorphicLayoutEffect(() => {
    const prevState = store.getState();

    // init async action status when call `useStatus`
    if (!prevState[actionWithName]) {
      prevState[actionWithName] = DEFAULT_STATUS;
    }

    function checkStatus() {
      const newStatus = store.getState(s => s[actionWithName]);
      const { pending, error } = statusRef.current;

      if (newStatus.pending === pending && error === newStatus.error) return;

      statusRef.current = newStatus;

      forceRender({});
    }

    return store.subscribe(actionWithName, checkStatus);
  }, [actionWithName]);

  return status;
}
