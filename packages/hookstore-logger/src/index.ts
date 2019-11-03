import { diff, Diff } from 'deep-diff';
// import clonedeep from 'lodash.clonedeep';
import { Context, Next, State, Middleware } from 'hookstore';

import { formatTime, tryClone } from './utils';
import { defaultOptions, Options } from './defaults';

interface ColorText<T> {
  color: T;
  text: T;
}

interface Dictionary<T> {
  [key: string]: T;
}

const dict: Dictionary<ColorText<string>> = {
  E: {
    color: '#2196F3',
    text: 'CHANGED:',
  },
  N: {
    color: '#4CAF50',
    text: 'ADDED:',
  },
  D: {
    color: '#F44336',
    text: 'DELETED:',
  },
  A: {
    color: '#2196F3',
    text: 'ARRAY:',
  },
};

function style(kind: keyof Dictionary<ColorText<string>>) {
  return `color: ${dict[kind].color}`;
}

// what's the type of `Diff`?
function render(elm: Diff<State>): Array<any> {
  const { kind, path, lhs, rhs, index, item } = elm as any;

  switch (kind) {
    case 'E':
      return [path.join('.'), lhs, '→', rhs];
    case 'N':
      return [path.join('.'), rhs];
    case 'D':
      return [path.join('.')];
    case 'A':
      return [`${path.join('.')}[${index}]`, item];
    default:
      return [];
  }
}

function titleFormatter(
  title: string,
  time: Date, 
  took: number,
  options: Options
): string {
  const parts = [`%c${title}`];

  parts.push(`%c@ ${formatTime(time)}`);
  if (options.showTook) parts.push(`%c(in ${took.toFixed(2)} ms)`);

  return parts.join(' ');
}

export type Options = Options;

export default (options?: Options): Middleware => async (ctx: Context, next: Next) => {
  options = options || defaultOptions;

  const { showDiff, showTook } = options;
  const { name, action, state } = ctx;
  const prevState = tryClone(state);
  const time = new Date();
  const greySty = 'color: gray; font-weight: lighter;';
  const headerCSS = ['color: inherit;', greySty, showTook ? greySty : ''];

  const result: any = await next();

  const changes = diff(prevState, state);
  const took = Date.now() - time.getTime();

  console.group(titleFormatter(`${name}/${action}`, time, took, options), ...headerCSS);
  console.log('%cprev state', 'color: #9E9E9E; font-weight: bold;', prevState);

  if (showDiff && changes) {
    changes.forEach((elem: Diff<State>) => {
      const { kind } = elem;
      const output = render(elem);

      console.log(`%c${dict[kind].text}`, style(kind), ...output);
    });
  }

  console.log('%cnext state', 'color: #4CAF50; font-weight: bold;', state);
  console.groupEnd();

  return result;
}
