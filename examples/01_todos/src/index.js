import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

// import { Provider, applyMiddlewares } from '@packages/hookstore';
import { Provider, applyMiddlewares } from 'hookstore';
import errorMiddleware from 'hookstore-error';
import loggerMiddleware from 'hookstore-logger';

import todos from './models/todos';

import App from './App';

function handleError(err) {
  const { namespace, action } = this.ctx;

  console.error(`${namespace}/${action}`, err);
}

function Root() {
  // applyMiddlewares([ loggerMiddleware ]);

  useLayoutEffect(() => {
    applyMiddlewares([errorMiddleware({ error: handleError }), loggerMiddleware]);
  }, []);

  return (
    <Provider models={[todos]}>
      <App />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
