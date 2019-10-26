English|[简体中文](./README.zh-CN.md)

# hookstore

[![NPM version](https://img.shields.io/npm/v/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
[![Build Status](https://img.shields.io/travis/react-kit/hookstore.svg?style=flat)](https://travis-ci.org/chemdemo/hookstore)
[![Coverage Status](https://img.shields.io/coveralls/react-kit/hookstore.svg?style=flat)](https://coveralls.io/r/chemdemo/hookstore)
[![NPM downloads](http://img.shields.io/npm/dm/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)

React Hooks (useContext) based and lightweight state manage library.

Try it on [Codesandbox](https://codesandbox.io/s/hookstore-counter-wbdh1)!

## Features

- Minimal(only 5 APIs) and familiar API, easy to learn and use(5 minutes about)
- Concepts simplified(only one `action` and no `reducer`/`dispatch`/`effects` in Redux/dva), `action` is just normal function which support `async/await`
- Centralized state management and multiple model support, `state` inside `action` and `middleware` is mutatable for easy understanding(while immutatable inside components)
- Built-in async status: Listening `pending` and `error` status of async action and update to DOM in real time by custom hook if needed
- Middlewares system, similar with [koa middleware](https://github.com/koajs/koa#middleware)

## Install

```bash
$ npm install hookstore
# or
$ yarn add hookstore
```

## Usage

Please check out all examples in the [examples](examples) folder.

### 1. model(s) definition

```javascript
// src/models/count.js
export default {
  namespace: 'count',
  state: {
    count: 0,
  },
  actions: {
    add(n) {
      const { state } = this.ctx;

      state.count += n;
    },
    async asyncAdd(n) {
      const { state } = this.ctx;

      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      state.count += n;
    },
    addx(n) {
      const { state, actions } = this.ctx;

      state.count += n;

      actions.asyncAdd(n);
      // await actions.asyncAdd(n); // use async/await can access asyncAdd() response
    },
  },
}
```

```javascript
// src/models/list.js
import { getActions } from 'hookstore'; // access actions from other model

export default {
  namespace: 'list',
  state: {
    list: [],
  },
  actions: {
    async addItems(len) {
      const { state } = this.ctx;
      const newList = await fetchList(len);

      state.list = newList;
    },

    async addByCount() {
      const { state, getState, actions } = this.ctx;
      const count = getState('count', s => s.count);

      if (count <= 0) return console.warn(`count ${count}!`);

      const newList = await fetchList(count);

      state.list = newList;
      getActions('count').add(1); // call count action
    },
  },
};
```

### 2. model(s) initialization

```javascript
import { Provider } from 'hookstore';

import countModel from './models/count';
import listModel from './models/list';

import Counter from './src/components/Counter';
import List from './src/components/List';

function Root() {
  return (
    <Provider models={[ countModel, listModel ]}>
      <h2>Counter</h2>
      <Counter />
      <Counter />
      <h2>List</h2>
      <List />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
```

### 3. access state and actions in child components
```javascript
// src/components/Counter.js
import { useStore } from 'hookstore';

export default () => {
  const [ count, actions ] = useStore('count', s => s.count);
  return (
    <div>
      {Math.random()}
      <div>
        <div>Count: {count}</div>
        <button onClick={() => actions.add(1)}>add 1</button>
        <button onClick={() => actions.addx(1)}>add 1 and async add 1</button>
      </div>
    </div>
  );
}
```

Listening the executing status of actions, such as `pending` if pending or `error` whenever if exception is thrown.

```javascript
// src/components/List.js
import { useStore, useStatus } from 'hookstore';

export default () => {
  const [ state, actions ] = useStore('list');
  const { pending, error} = useStatus('list/addItems');
  const addItems = () => {
    if (pending) return console.log('pls wait....');
    actions.addItems(5);
  };

  return (
    <div>
      {Math.random()}
      <div>
        { pending && <div>loading...<div> }
        { error && <div>{error.message}<div> }
        <div>List items: {state.list.join()}</div>
        <button onClick={addItems}>async add 5 items</button>
      </div>
    </div>
  );
};
```

## API

### `<Provider models>`

The `Provider` has to be put in the parent component, and maybe `Provider` as root component is recommended.

```javascript
const Root = () => (
  <Provider models={[ model1, model2 ]}>
    ...
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));
```

### useStore(namespace[, selector = state => state])

It simply returns the `[state, actions]` tuple, the `state` ref to the lastest state of model, and `actions` is collection of methods which is the recommended way to modify the status safely.

```javascript
const Component = () => {
  const [ name, actions ] = useStore('foo', s => s.name);
  // ...
};
```

### useStatus(namespace/action)

`useStatus` hook is usually used to get the execution status of asynchronous actions in real time, and all components used `useStatus` hook will received the actions status update and then update to the DOM.

```javascript
const Component = () => {
  const { pending, error } = useStatus('foo/someAsyncAction');
  // ...
}
```

### getActions(namespace)

`getActions` returns all actions of some model, ractically it is safe to call actions outside React Components, you can call actions anyway such as passing as props to a child component which wrappered with `React.memo` or `React.useMemo`.

```javascript
// models/foo.js
import { getActions } from 'hookstore';

export default {
  namespace: 'foo',
  actions: {
    const barActions = getActions('bar'); // access actions from `bar` model
    // ...
  }
}
```

### applyMiddlewares([middleware1, middleware2, ...])

Appling [koa-like middleware](https://github.com/koajs/koa#middleware) to all the action.

```javascript
import { Provider, applyMiddlewares } from 'hookstore';
import errorMiddleware from 'hookstore-error';
import loggerMiddleware from 'hookstore-logger';

import countModel from './models/count';
import listModel from './models/list';

import Counter from './src/components/Counter';
import List from './src/components/List';

function Root() {
  useLayoutEffect(() => {
    // if (/localhost|\btest\b/.test(location.hostname)) {
    applyMiddlewares([ errorMiddleware(), loggerMiddleware ]);
    // }
  }, []);

  return (
    <Provider models={[ countModel, listModel ]}>
      <h2>Counter</h2>
      <Counter />
      <Counter />
      <h2>List</h2>
      <List />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
```

custom middleware:

```javascript
// middlewares/errHandler.js
export default async (ctx, next) => {
  try {
    await next();
  } catch(e) {
    console.error(`${ctx.namespace}/${ctx.action}`, e);
  }
}

// use middleware
import errHandler from 'errHandler';

function Root() {
  applyMiddlewares([errHandler]);

  return (
    <Privider model={model}>
      // ...
    </Privider>
  );
}
```

## Examples

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
$ cd examples/[folder] && npm start
```

then open <http://localhost:3000> in your web browser.

## License

MIT © [chemdemo](https://github.com/chemdemo)
