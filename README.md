English | [简体中文](./README.zh-CN.md)

# hookstore

[![NPM version](https://img.shields.io/npm/v/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
[![Build Status](https://img.shields.io/travis/react-kit/hookstore.svg?style=flat)](https://travis-ci.org/react-kit/hookstore)
[![Coverage Status](https://img.shields.io/coveralls/react-kit/hookstore.svg?style=flat)](https://coveralls.io/r/react-kit/hookstore)
[![NPM downloads](http://img.shields.io/npm/dm/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
[![size](https://badgen.net/bundlephobia/minzip/hookstore@latest)](https://bundlephobia.com/result?p=hookstore@latest)
![React](https://img.shields.io/npm/dependency-version/hookstore/peer/react?logo=react)

Hook based and lightweight centralized state management for React.

## Try it on codesandbox
[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hookstore-counter-wbdh1)

## Features

- **Minimal(only 5 APIs) and simplified API**: easy to learn(5 minutes about), no `reducer`, `dispatch` or `effects` in Redux/dva, only `action` which is just normal function with `async/await` support.
- **Centralized state management and multiple models**: `model` is just normal javascript object, `state` inside `action`(and `middleware`)is mutatable for understanding while immutatable inside components(follow the design of React's unidirectional data flow).
- **Performance optimized**: `useStore` api is inspired by react-redux-hooks [useSelector](https://react-redux.js.org/api/hooks#useselector), the [preformance issue caused by useContext](https://github.com/facebook/react/issues/15156) is controlled, only component(s) which used `useStore` hook will be re-rendered when state changed. 
- **Built-in action status listening**: Listening `pending` and `error` status of (async)action and update to DOM in real time when action's status change.
- **[koa](https://github.com/koajs/koa#middleware) style middleware system**

## Install

```bash
$ npm install hookstore -S
# or
$ yarn add hookstore
```

## Usage

Please check out all examples in the [examples](examples) folder.

### 1. model(s) definition

```javascript
// src/models/count.js
export default {
  name: 'count',
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

### 2. model(s) initialization

```javascript
import { Provider } from 'hookstore';

import countModel from './models/count';
import listModel from './models/list';

import Counter from './src/components/Counter';

ReactDOM.render(
  <Provider models={[ countModel ]}>
    <Counter />
    <Counter />
  </Provider>
  , document.getElementById('root')
);
```

### 3. Access state and actions in child components
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

### useStore(name, selector?: Function, equalityFn?: Function) => [ selectedState, actions ]

`useStore` integrated the `useSelector` and `useDispatch()` Apis in [react-redux v7.x](https://react-redux.js.org/next/api/hooks#useselector), it returns the latest state in store and the collect of actions methods(which can safely modify store's state) by tuples.

- name: The name of model
- selector: Pure function with which can extract data from store, the default value is `(state) => state` which will returns the state object in store.**It's highly recommended to pass in `selector`** to select state in need, components will re-render only if the selected keys changes.
- equalityFn: the default value is the same as `connect` of react-redux, optional comparison function also enables using something like Lodash's `_.isEqual()`.

```javascript
const Component = () => {
  const [ name, actions ] = useStore('foo', s => s.name);
  const [ nested, actions ] = useStore('bar', s => s.nested, _.isEqual);
  // ...
};
```

### useStatus(name/action) => { pending: boolean, error: Error }

`useStatus` hook listens the execution status of (asynchronous)actions in real time, and all components used `useStatus` hook will receive the actions status update and then render to the DOM.

```javascript
// src/components/CounterWithLoading.js
import { useStore, useStatus } from 'hookstore';

const CounterWithLoading = () => {
  const [ { count }, actions ] = useStore('count', s => c.count);
  const { pending, error } = useStatus('count/asyncAdd');
  const asyncAdd = () => {
    if (pending) return console.log('pls wait...');
    actions.asyncAdd(5);
  };

  return (
    <div>
      {Math.random()}
      <div>
        { pending && <div>loading...<div> }
        { error && <div>{error.message}<div> }
        <div>count: {count}</div>
        <button onClick={asyncAdd}>async add 5</button>
      </div>
    </div>
  );
};
```

### getStore(name, selector?: Function) => [ selectedState, actions ]

The params and returns of `getStore` is the same as `useStore`, the difference is that `getStore` is not a React Hook, it;'s just a normal function, so the usage of `getStore` is not restricted by Hook Rules(maybe outside of React components), but you should known that `useStore` can not listen the changes of state, you should call `useStore` again to get the lastest state.

```javascript
// models/foo.js
import { getStore } from 'hookstore';

export default {
  name: 'foo',
  actions: {
    const [ , barActions ] = getStore('bar'); // access actions from `bar` model
    // ...
  }
}
```

### applyMiddlewares([middleware1, middleware2, ...])

Appling [koa-style middleware](https://github.com/koajs/koa#middleware) to all of the actions.

```javascript
import { Provider, applyMiddlewares } from 'hookstore';
import errorMiddleware from 'hookstore-error';
import loggerMiddleware from 'hookstore-logger';

import countModel from './models/count';
import listModel from './models/list';

import Counter from './src/components/Counter';
import List from './src/components/List';

function Root() {
  useEffect(() => {
    // if (/localhost|\btest\b/.test(location.hostname)) {
    applyMiddlewares([ errorMiddleware(), loggerMiddleware({ showDiff: true }) ]);
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
    console.error(`${ctx.name}/${ctx.action}`, e);
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

## model(s) definition

`model` is just normal javascript object:
```typescript
interface Model {
  readonly name: string, // name of model
  state?: {}, // model state
  actions: {
    [action: string]: ({this: {ctx: Context}}) => any | Promise<any>
  },
}
```

example:
```javascript
// src/models/foo.js
export default {
  name: 'foo', // model name
  actions: {
    setName(newName) {
      this.ctx.state.name = newName;
    },
    async asyncSetName(newName) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.ctx.state.name = newName;
    }
  },
}
```

### The `ctx`

The `ctx` store some intermediate states and methods which can only access inside of actions and middlewares.

Type definition:
```typescript
interface Actions {
  [ action: string ]: (...args: any[]) => Promise<any>;
}

interface Context<S = {}> {
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
}
```

## Run examples locally

The [examples](examples) folder contains working examples.
You can run one of them with

```bash
$ cd examples/[folder] && npm start
```

then open <http://localhost:3000> in your web browser.

## License

MIT
