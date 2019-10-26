import * as React from 'react';
import { PropsWithChildren } from 'react';

export type State = {};

export type ActionFn = () => any | Promise<any>;

// export type BoundActionHandler = (this: { ctx: Context }, ...args: any[]) => Promise<any>;
export type BoundActionHandler = (...args: any[]) => Promise<any>;

// selector(state => state.count);
export type StateSelector<S, O> = (state: S) => O;

export interface Actions {
  [ action: string ]: BoundActionHandler
}

export interface Context<S = State> {
  readonly namespace: string,
  readonly action: string,
  state: S,
  actions: Actions,
  getState: <O extends any>(namespace?: string, selector?: StateSelector<S, O>) => O,
  flush: () => void,
}

export interface Model {
  readonly namespace: string,
  state: State,
  actions: {
    [action: string]: ActionFn,
  },
  middlewares?: Middleware[],
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

export function useStore<S = State, O = any>(
  namespace: string,
  selector?: StateSelector<S, O>,
): [ State, Actions ];

export interface ActionStatus {
  error: null | Error,
  pending: boolean,
}

export function useStatus(actionWithNS: string): ActionStatus;

export function getActions(namespace: string): Actions;

export function applyMiddlewares(middlewares: Middleware[]): void;
