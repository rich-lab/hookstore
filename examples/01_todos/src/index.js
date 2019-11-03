import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { Provider, applyMiddlewares } from 'hookstore';
import errorMiddleware from 'hookstore-error';
import loggerMiddleware from 'hookstore-logger';

import todos from './models/todos';

import App from './App';

function handleError(err) {
  const { name, action } = this.ctx;

  console.error(`${name}/${action}`, err);
}

function Root() {
  // applyMiddlewares([ loggerMiddleware ]);

  useEffect(() => {
    applyMiddlewares([
      errorMiddleware({ error: handleError }),
      loggerMiddleware({ showDiff: true }),
    ]);
  }, []);

  return (
    <Provider models={[todos]}>
      <App />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
