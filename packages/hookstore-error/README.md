# hookstore-error

error handler middeware for [hookstore](https://github.com/chemdemo/hookstore.git)

## Install

```bash
$ npm install hookstore-error
# or
$ yarn add hookstore-error
```

## Usage

```javascript
import { Provider, applyMiddlewares } from 'hookstore';
import errorHandler from 'hookstore-error';

const model = {
  namespace: 'foo',
  state: {},
  actions: {},
};

function App() {
  // App component code
}

function Root = () => {
  const middlewares = [
    errorHandler(),
    // add other middlewares
  ];

  applyMiddlewares(middlewares);

  return <Provider model={model}><App /></Provider>;
}

ReactDOM.render(<Root />, document.querySelector('app'));
```

Custom error handle function for yourself:

```javascript
function handleError(err) {
  const { namespace, action, state } = this.ctx;

  console.error(`${namespace}/${action} error`, err);
}

const middlewares = [
  errorHandler({ error: handleError }),
  // add other middlewares
];
applyMiddlewares(middlewares);
```

Injoy it!
