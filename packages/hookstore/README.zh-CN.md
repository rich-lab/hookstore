简体中文 | [English](./README.md)

# hookstore

[![NPM version](https://img.shields.io/npm/v/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
[![Build Status](https://img.shields.io/travis/react-kit/hookstore.svg?style=flat)](https://travis-ci.org/react-kit/hookstore)
[![Coverage Status](https://img.shields.io/coveralls/react-kit/hookstore.svg?style=flat)](https://coveralls.io/r/react-kit/hookstore)
[![NPM downloads](http://img.shields.io/npm/dm/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
![React](https://img.shields.io/npm/dependency-version/hookstore/peer/react?logo=react)

基于React Hooks的轻量级状态管理方案。

## 在线查看demo
[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hookstore-counter-wbdh1)

## 特性

- **轻量级**：基于原生Hooks API实现（且仅有5个API），易于学习上手，将Redux/dva中众多的概念（reducer、action、dispatch、effects）简化为action（异步action支持`async/await`写法）
- **数据中心化管理**：model(s)定义类似[dva](https://github.com/dvajs/dva)，支持多model，action和中间件内部使用mutatable方式修改state易于理解（React组件内以immutatable方式访问state，遵循React单向数据流的设计理念）
- **高性能**：useStore的设计参考了react-redux-hooks [useSelector](https://react-redux.js.org/api/hooks#useselector)，当state变更时只会刷新使用了useStore的组件，不会引起在Fiber tree上的其他节点re-render，且组件在re-render前会经过严格的diff检查，对[useContext引起的性能问题](https://github.com/facebook/react/issues/15156)做了充分的优化
- **内置异步action状态监听hook**：按需监听异步action的执行状态（`pending`和`error`），并及时将最新状态同步更新到DOM，简化异步编程
- **[koa](https://github.com/koajs/koa#middleware)风格的中间件系统**

## 安装

```bash
$ npm install hookstore -S
# or
$ yarn add hookstore
```

## 使用

更多示例请查看[examples](examples)目录。

### 1. 中心化的model(s)定义

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

```javascript
// src/models/list.js
export default {
  name: 'list',
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
      const { state, actions, getStore } = this.ctx;
      const [ count, countActions ] = getStore('count', s => s.count); // access other store by getStore(modelName)

      if (count <= 0) return console.warn(`count ${count}!`);

      const newList = await fetchList(count);

      state.list = newList;
      countActions.add(1); // call count action
    },
  },
};
```

### 2. model(s)绑定

```javascript
import { Provider } from 'hookstore';

import countModel from './models/count';
import listModel from './models/list';

import Counter from './src/components/Counter';
import List from './src/components/List';

ReactDOM.render(
  <Provider models={[ countModel, listModel ]}>
    <h2>Counter</h2>
    <Counter />
    <Counter />
    <h2>List</h2>
    <List />
  </Provider>
  , document.getElementById('root')
);
```

### 3. 在组件中访问state和actions
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

监听action的执行状态，目前包含`pending`和`error`两种状态，`abort`暂未支持。

```javascript
// src/components/List.js
import { useStore, useStatus } from 'hookstore';

export default () => {
  const [ state, actions ] = useStore('list');
  const { pending, error} = useStatus('list/addItems');
  const addItems = () => {
    if (pending) return console.log('pls wait...');
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

`Provider`API是对Context.Provider的封装，强烈建议将`<Provider>`作为应用的根节点，使用后面`useStore`或`useStatus`等自定义hook的组件都必须作为`<Provider>`的子（孙）节点！

```javascript
const Root = () => (
  <Provider models={[ model1, model2 ]}>
    ...
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('root'));
```

### useStore(name[, selector = state => state]) => [ selectedState, actions ]

自定义hook，以元组的形式返回store中最新的state和可安全修改state的actions方法集合。`useStore`整合了react-redux `useSelector()`和`useDispatch()`两个hook的功能，**强烈推荐传入`selector`按需选择所需state**，只有被选择的state改变时组件才会re-render。

> 1、直接修改此处的state是不安全的（修改不会被同步更新到组件），只有action函数和中间对state的修改是安全的！<br />2、actions是一个不可变对象，这意味着可以直接将actions直接传递给子组件而不会引起重新渲染、useMemo或useCallback的deps也无需将actions作为依赖项。

```javascript
const Component = () => {
  const [ name, actions ] = useStore('foo', s => s.name);
  // ...
};
```

### useStatus(name/action) => { pending: boolean, error: Error }

`useStatus` hook，用于监听（异步）action的执行状态，返回`pending`和`error`两个状态，当action正在执行时`pending=true`，当执行出错时`error`为具体错误对象，当执行状态发生变化时会同步更新到DOM。

```javascript
const Component = () => {
  const { pending, error } = useStatus('foo/someAsyncAction');
  // ...
}
```

### getStore(name[, selector = state => state]) => [ selectedState, actions ]

`getStore`的参数和返回类型和`useStore`一致，区别是`getStore`不是React Hook，因此调用不受Hook Rules的限制（可以在组件外部调用），但要注意useStore没有监听功能，state改变不会引起re-render。

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

为action添加中间件，写法类似[koa中间件](https://github.com/koajs/koa#middleware)。

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

中间件定义：

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

## model定义

`model`是普通的javascript对象，类型申明：

```typescript
interface Model {
  readonly name: string, // name of model
  state?: {}, // model state
  actions: {
    [action: string]: ({this: {ctx: Context}}) => any | Promise<any>
  },
}
```

定义一个model：

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

### `ctx`对象

`ctx`对象可以在action和middleware中访问，存储store的一些中间状态和方法。

类型申明：
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

## 本地运行示例

[examples](examples)文件夹包含所有可用代码示例，可以通过以下命令运行示例代码：

```bash
$ cd examples/[folder] && npm run install && npm start
```

然后用浏览器打开<http://localhost:3000>即可。

## License

MIT
