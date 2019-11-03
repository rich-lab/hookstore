import * as React from 'react';
import { PropsWithChildren } from 'react';

export type State = {};

export type ActionFn = () => any | Promise<any>;

export interface Model {
  readonly name: string, // name of model
  state?: State, // model state
  actions: {
    [action: string]: ActionFn,
  },
  // middlewares?: Middleware[],
}

// export type BoundAction = (this: { ctx: Context }, ...args: any[]) => Promise<any>;
export type BoundAction = (...args: any[]) => Promise<any>;

export interface Actions {
  [ action: string ]: BoundAction
}

// selector(state => state.count);
export type StateSelector<S = State> = (state: S) => any;

// export interface Store<S = State> {
//   getState<O extends any>(selector?: StateSelector<S, O>): O;
//   actions: Actions;
// }

export interface Context<S = State> {
  // access current store's name
  readonly name: string,
  // access current action's name
  readonly action: string,
  // access the lastest state in current store
  state: S,
  // access the bound action collection of current store
  actions: Actions,
  // access the lastest state and actions of some other store
  getStore: (name?: string, selector?: StateSelector<S>) => [ any, Actions ],
  // getStore: (name?: string) => Store,
  // getState: <V extends any>(name?: string, selector?: StateSelector<S, V>) => V,
  // flush the changed state to DOM(inside action handler) before action run finished
  flush: (msg?: string) => void,
}

export type Next = () => Promise<any>;

export interface Middleware {
  (ctx: Context, next: Next): Promise<any>;
}

export type ProviderProps = {
  model?: Model,
  models?: Model[],
}

export const Provider: React.FC<PropsWithChildren<ProviderProps>>;

export function useStore<S = State>(
  name: string,
  selector?: StateSelector<S>,
): [ any, Actions ];

export interface ActionStatus {
  error: null | Error,
  pending: boolean,
}

export function useStatus(actionWithName: string): ActionStatus;

export function getStore<S = State>(name: string, selector?: StateSelector<S>): [ any, Actions ];

export function applyMiddlewares(middlewares: Middleware[]): void;
