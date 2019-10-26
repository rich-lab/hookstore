import { diff } from 'deep-diff';
import clonedeep from 'lodash.clonedeep';
import { Context, Next } from 'hookstore';

const dictionary: any = {
  E: {
    color: '#2196F3',
    text: 'updated:',
  },
  N: {
    color: '#4CAF50',
    text: 'added:',
  },
  D: {
    color: '#F44336',
    text: 'deleted:',
  },
  A: {
    color: '#2196F3',
    text: 'added:',
  },
};

function style(kind: string) {
  return `color: ${dictionary[kind].color}`;
}

function render(elm: any) {
  const { kind, path, lhs, rhs, index, item } = elm;

  switch (kind) {
  case 'E':
    return `${path.join('.')} ${lhs} → ${rhs}`;
  case 'N':
    return `${path.join('.')} ${rhs}`;
  case 'D':
    return `${path.join('.')}`;
  case 'A':
    return [`${path.join('.')}[${index}]`, item];
  default:
    return null;
  }
}

// @see https://github.com/evgenyrodionov/redux-diff-logger
export default async (ctx: Context, next: Next) => {
  const { namespace, action, state } = ctx;
  const prevState = clonedeep(state);
  const time = new Date();

  const result: any = await next();

  const changes = diff(prevState, state);

  console.group(`${namespace}/${action} @ ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`);
  console.log('prev state', prevState);

  if (changes) {
    changes.forEach((elem: any) => {
      const { kind } = elem;
      const output = render(elem);

      console.log(`%c${dictionary[kind].text}`, style(kind), output);
    });
  }

  console.log('next state', state);
  console.groupEnd();

  return result;
}
