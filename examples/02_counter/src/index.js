import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

// import { Provider, applyMiddlewares } from '@packages/hookstore';
import { Provider, applyMiddlewares } from 'hookstore';
import errorMiddleware from 'hookstore-error';
import loggerMiddleware from 'hookstore-logger';

import commonModel from './models/common';
import countModel from './models/count';
import listModel from './models/list';

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
    <Provider models={[commonModel, countModel, listModel]}>
      <App />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
