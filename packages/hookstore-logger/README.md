# hookstore-logger

[![NPM version](https://img.shields.io/npm/v/hookstore-logger.svg?style=flat)](https://npmjs.org/package/hookstore-logger)
[![Build Status](https://img.shields.io/travis/react-kit/hookstore.svg?style=flat)](https://travis-ci.org/react-kit/hookstore)
[![Coverage Status](https://img.shields.io/coveralls/react-kit/hookstore.svg?style=flat)](https://coveralls.io/r/react-kit/hookstore)
[![NPM downloads](http://img.shields.io/npm/dm/hookstore-logger.svg?style=flat)](https://npmjs.org/package/hookstore-logger)

redux-logger style middeware for [hookstore](https://github.com/react-kit/hookstore.git)

![hookstore-logger](docs/screenshot.png)

## Install

```bash
$ npm install hookstore-logger -D
# or
$ yarn add hookstore-logger
```

## Usage

```javascript
import { Provider, applyMiddlewares } from 'hookstore';
import logger from 'hookstore-logger';

const model = {
  name: 'foo',
  state: {},
  actions: {},
};

function App() {
  // App component code
}

function Root = () => {
  const middlewares = [
    logger({ showDiff: true, showTook: true }),
    // add other middlewares
  ];

  applyMiddlewares(middlewares);

  return <Provider model={model}><App /></Provider>;
}

ReactDOM.render(<Root />, document.querySelector('app'));
```

Injoy it!
