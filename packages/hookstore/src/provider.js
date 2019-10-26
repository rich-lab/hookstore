import React, {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDebugValue,
} from 'react';
import invariant from 'invariant';
import clonedeep from 'lodash.clonedeep';

import { isFunction, isString, checkModels } from './util';
import { actionStatusModel } from './statusModel';
import { ContextMap } from './context';
import { StateRefMap, getState } from './stateRef';
import { createActions } from './action';
import { applyMiddlewares } from './middlewares';

export function Provider({ model, models, children }) {
  checkModels({ model, models });

  models = models || (model ? [model] : []);

  // manage action status
  models.push(actionStatusModel);

  let providers;

  // create a Context for each model!
  // for (const model of models) {
  //   providers = <StoreProvider model={model}>{providers || children}</StoreProvider>;
  // }
  models.forEach(m => {
    providers = <StoreProvider model={m}>{providers || children}</StoreProvider>;
  });

  return providers;
}

function StoreProvider({ model, children }) {
  const { namespace, state: initialState = {}, actions = {} } = model;
  const [state, dispatch] = useState(initialState);
  // const listenRef = useRef([]);
  // const subscribe = useCallback(listener => {
  //   listenRef.current.push(listener);

  //   return () => {
  //     listenRef.current = listenRef.current.filter(fn => fn !== listener);
  //   };
  // }, []);
  const providerValue = {
    state,
    dispatch,
    actions: useMemo(() => createActions(namespace, actions), [namespace, actions]),
    // subscribe,
  };

  let Context = ContextMap.get(namespace);

  if (!Context) {
    Context = createContext(providerValue);
    Context.displayName = namespace;
    ContextMap.set(namespace, Context);
  }

  // update state in Context after every re-render
  useEffect(() => {
    Context._currentValue.state = state;
  });

  // for data diff
  const stateRef = useRef(null);
  if (!getState(namespace)) {
    stateRef.current = clonedeep(initialState);
    StateRefMap.set(namespace, stateRef);
  }

  useEffect(() => {
    // clean
    return () => {
      ContextMap.delete(namespace);
      StateRefMap.delete(namespace);
      // reset middlewares
      applyMiddlewares([]);
    };
  }, [namespace]);
  // console.log('-------Provider render----');

  return createElement(Context.Provider, { value: providerValue }, children);
}

// access state in FC
// compatible with `useSelector` in react-redux
export function useStore(namespace, selector) {
  invariant(namespace && isString(namespace), 'You must pass a namespace to useStore()');

  const Context = ContextMap.get(namespace);
  const isFn = isFunction(selector);

  invariant(
    Context,
    `store with namespace[${namespace}] has not created, please ensure the component is wrapped in a <Provider>`,
  );

  useDebugValue(namespace);

  const { state, actions } = useContext(Context);
  const selectedState = isFn ? selector(state) : state;

  return [selectedState, actions];
  // return useMemo(() => [selectedState, actions], [selectedState, actions]);
}
