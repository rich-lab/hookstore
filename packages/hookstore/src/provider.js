import React, {
  createElement,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useDebugValue,
} from 'react';
import invariant from 'invariant';

import {
  isFunction,
  isString,
  checkModels,
  useForceRender,
  useIsomorphicLayoutEffect,
  tryClone,
  shallowEqual,
} from './utils';
import { actionStatusModel } from './statusModel';
import { getContext, createContext, deleteContext } from './context';
import createStore from './createStore';
import { applyMiddlewares } from './middlewares';

const StoreProvider = memo(({ model, children }) => {
  const { name } = model;
  const store = useMemo(() => createStore(model), [model]);

  let Context = getContext(name);

  if (!Context) {
    Context = createContext(name, store);
  }

  useEffect(() => {
    // cleanup context
    return () => {
      deleteContext(name);
    };
  }, [name]);

  return createElement(Context.Provider, { value: store }, children);
});

// Provider HOC
export const Provider = memo(({ model, models, children }) => {
  checkModels({ model, models });

  models = models || (model ? [model] : []);

  // manage action status
  models.push(actionStatusModel);

  let providers;

  // create a context for each model!
  for (let i = 0; i < models.length; i++) {
    providers = <StoreProvider model={models[i]}>{providers || children}</StoreProvider>;
  }

  useEffect(() => {
    // reset global middlewares
    return () => {
      applyMiddlewares([]);
    };
  }, []);

  return providers;
});

// access state in FC
// compatible with `useSelector` in react-redux
export function useStore(name, selector = s => s, equalityFn = shallowEqual) {
  invariant(name && isString(name), 'You must pass a name to useStore()');
  invariant(selector && isFunction(selector), '`selector` should be function');

  const Context = getContext(name);

  invariant(
    Context,
    `store with name[${name}] has not created, please ensure the component is wrapped in a <Provider>`,
  );

  useDebugValue(name);

  const forceRender = useForceRender();
  const store = useContext(Context);
  const ref = useRef({});
  let value;

  if (selector !== ref.current.selector) {
    value = selector(store.getState());
  } else {
    value = ref.current.value;
  }

  useIsomorphicLayoutEffect(() => {
    ref.current = {
      selector,
      value: tryClone(value),
    };
  });

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      const state = store.getState();
      const prev = ref.current;
      const newValue = prev.selector(state);

      // console.log('-->prev.value: %j, newValue: %j', prev.value, newValue);
      if (equalityFn(newValue, prev.value)) return;

      prev.value = newValue;

      forceRender({});
    }

    return store.subscribe(checkForUpdates);
  }, [store]);

  return [value, store.actions];
}
