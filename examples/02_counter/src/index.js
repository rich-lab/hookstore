import React, { useEffect } from 'react';
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
  const { name, action } = this.ctx;

  console.error(`${name}/${action}`, err);
}

function Root() {
  // applyMiddlewares([ loggerMiddleware ]);

  useEffect(() => {
    applyMiddlewares([
      errorMiddleware({ error: handleError }),
      loggerMiddleware({ showDiff: true, showTook: true }),
    ]);
  }, []);

  return (
    <Provider models={[commonModel, countModel, listModel]}>
      <App />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
