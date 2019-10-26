import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import errorHandler from '../src';
import { Provider, useStore, applyMiddlewares, getActions } from '../../hookstore';

describe('error middleware', () => {
  it('should capture action error', async () => {
    const model = {
      namespace: 'a',
      state: {},
      actions: {
        err() {
          throw Error('some error');
        }
      }
    };
    const App = () => {
      return <div>print error</div>;
    };
    const Test = () => {
      const middlewares = [
        errorHandler(),
      ];

      applyMiddlewares(middlewares);

      return <Provider model={model}><App /></Provider>;
    };

    render(<Test />);

    const actions = getActions('a');

    await expect(actions.err()).rejects.toThrow(/some error/);
  });

  it('oprions.error should work', async () => {
    const model = {
      namespace: 'a',
      state: {},
      actions: {
        err() {
          throw Error('some error');
        }
      }
    };
    const App = () => {
      const [ , actions ] = useStore('a');

      return <div data-testid="err" onClick={actions.err}>print error</div>;
    };
    const Test = () => {
      const middlewares = [
        errorHandler({
          error(err) {
            const { namespace, action } = this.ctx;

            expect(namespace).toEqual('a');
            expect(action).toEqual('err');
            expect(err.message).toEqual('some error');
            expect(err).toBeInstanceOf(Error);
          }
        }),
      ];

      applyMiddlewares(middlewares);

      return <Provider model={model}><App /></Provider>;
    };
    const { getByTestId } = render(<Test />);

    fireEvent.click(getByTestId('err'));
  });
});
