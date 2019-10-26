# hookstore-logger

redux-logger like middeware for [hookstore](https://github.com/chemdemo/hookstore.git)

## Install

```bash
$ npm install hookstore-logger
# or
$ yarn add hookstore-logger
```

## Usage

```javascript
import { Provider, applyMiddlewares } from 'hookstore';
import logger from 'hookstore-logger';

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
    logger,
    // add other middlewares
  ];

  applyMiddlewares(middlewares);

  return <Provider model={model}><App /></Provider>;
}

ReactDOM.render(<Root />, document.querySelector('app'));
```

Injoy it!
