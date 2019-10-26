简体中文|[English](./README.md)

# hookstore

[![NPM version](https://img.shields.io/npm/v/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)
[![Build Status](https://img.shields.io/travis/chemdemo/hookstore.svg?style=flat)](https://travis-ci.org/chemdemo/hookstore)
[![Coverage Status](https://img.shields.io/coveralls/chemdemo/hookstore.svg?style=flat)](https://coveralls.io/r/chemdemo/hookstore)
[![NPM downloads](http://img.shields.io/npm/dm/hookstore.svg?style=flat)](https://npmjs.org/package/hookstore)

基于React Hooks（useContext）的轻量级状态管理方案。

查看在线demo [Codesandbox](https://codesandbox.io/s/hookstore-counter-wbdh1)。

## 特性

- 轻量级（基于原生Hooks API实现且仅有5个API）且友好的API设计，易于学习上手（5分钟）
- 概念极少，将Redux/dva中众多的概念（reducer、action、dispatch、effects）简化为action，异步支持async/await写法
- 中心化的数据管理，model(s)定义类似[dva](https://github.com/dvajs/dva)，支持多model，action和中间件内部使用mutatable方式修改state易于理解（React组件内以immutatable方式访问state）
- 通过自定义hook方式按需监听异步action的执行状态（pending和error），并及时将最新状态同步更新到DOM
- 中间件系统，写法上与[koa中间件](https://github.com/koajs/koa#middleware)写法几乎一致

## 安装

```bash
$ npm install hookstore
# or
$ yarn add hookstore
```

## 使用

更多示例请查看[examples](examples)目录。

### 1. 中心化的model(s)定义

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
// 通过getActions获取某一个model上挂载的所有actions，actions的调用是安全的！
import { getActions } from 'hookstore';

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

### 2. model(s)绑定

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

ReactDOM.render(<Root />, document.getElementById('root'))
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

### useStore(namespace[, selector = state => state])

自定义hook，用于访问一个model所定义的state和actions（所有用于操作state的方法）。跟useState一样，`useStore`只返回一个`[state, actions]` 元组。

> 1、直接修改此处的state是不安全的（修改不会被同步更新到组件），只有action函数和中间对state的修改是安全的！<br />2、actions是一个不可变对象，这意味着可以直接将actions直接传递给子组件而不会引起重新渲染、useMemo或useCallback的deps也无需将actions作为依赖项。

```javascript
const Component = () => {
  const [ name, actions ] = useStore('foo', s => s.name);
  // ...
};
```

### useStatus(namespace/action)

`useStatus`自定义hook，用于监听action的执行状态，返回`pending`和`error`两个状态，当异步action正在执行时`pending=true`，当执行出错时`error`为具体错误对象，当执行状态发生变化时会同步更新到DOM。

```javascript
const Component = () => {
  const { pending, error } = useStatus('foo/someAsyncAction');
  // ...
}
```

### getActions(namespace)

`getActions`返回一个model上绑定的所有action函数，你可以在任意位置（在`<Provider>`调用之后）调用`getActions`获取actions对象而不局限于React组件内部。

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

中间件定义：

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

## 示例

[examples](examples)文件夹包含所有可用代码示例，可以通过以下命令运行示例代码：

```bash
$ cd examples/[folder] && npm run install && npm start
```

然后用浏览器打开<http://localhost:3000>即可。

## License

MIT © [chemdemo](https://github.com/chemdemo)
