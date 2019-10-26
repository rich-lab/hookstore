import { isFunction } from './util';

export const StateRefMap = new Map();

export function getState(namespace, selector) {
  const refState = StateRefMap.get(namespace);
  const currentState = refState && refState.current;

  if (currentState) {
    const selectState = isFunction(selector) ? selector(currentState) : currentState;
    return selectState;
  }

  return currentState;
}
