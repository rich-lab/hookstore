import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { createActions, useStatus } from '../src/action';
import { Provider, useStore } from '../src/provider';
import { getStore } from '../src/store';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 1));

describe('action', () => {
  describe('#createActions', () => {
    it('should throw', async () => {
      expect(() => useStatus()).toThrow();
      expect(() => useStatus('a/b')).toThrow();
    });

    it('should work', () => {
      const actions = {
        foo() {},
        bar() {}
      };
      const newActions = createActions('test', actions);

      expect(newActions.foo).toBeTruthy();
      expect(newActions.bar).toBeTruthy();
    });

    it('actions should be plain object', () => {
      expect(() => createActions('test')).toThrow(/should be plain object/);
      expect(() => createActions('test', null)).toThrow(/should be plain object/);
      expect(() => createActions('test', [])).toThrow(/should be plain object/);
      expect(() => createActions('test', () => {})).toThrow(/should be plain object/);
    });

    it('actions item value should be function', () => {
      expect(() => createActions('test', {a: 1})).toThrow(/should be function/);
    });
  });

  describe('#useStatus', () => {
    const model = {
      name: 'test',
      state: {
        count: 0
      },
      actions: {
        async add() {
          await wait(500);
          this.ctx.state.count += 1;
        }
      }
    };

    afterEach(cleanup);

    it('should work', async () => {
      const jestFn = jest.fn();
      const App = () => {
        const [ { count }, actions ] = useStore('test');
        const { pending } = useStatus('test/add');
        // console.log('render----------------------', count, pending);

        jestFn();

        return (
          <>
            {pending ? <div data-testid="loading">loading...</div> : null}
            <div data-testid="count" onClick={actions.add}>count:{count}</div>
          </>
        );
      };
  
      const Test = () => <Provider model={model}><App /></Provider>;
  
      const { getByTestId } = render(<Test />);
      const countDiv = getByTestId('count');
      let loadingDiv;
  
      expect(countDiv.textContent).toEqual('count:0');
      expect(jestFn).toHaveBeenCalledTimes(1);

      fireEvent.click(countDiv);
      
      loadingDiv = await waitForElement(() => getByTestId('loading'));

      expect(loadingDiv.textContent).toEqual('loading...');
      expect(jestFn).toHaveBeenCalledTimes(2);
  
      // wait for promise finish
      await act(async () => await wait(1000));
  
      expect(countDiv.textContent).toEqual('count:1');
      expect(jestFn).toHaveBeenCalledTimes(3);
      // expect(loadingDiv).toBeFalsy();
    });
  });

  describe('#getStore', () => {
    it('should work', async () => {
      const model = {
        name: 'test',
        state: {
          count: 0
        },
        actions: {
          add() {
            this.ctx.state.count += 1;
          }
        }
      };
  
      const App = () => {
        const [ { count } ] = useStore('test');
  
        return (
          <>
            <div data-testid="count">count:{count}</div>
            <CountBtn />
          </>
        );
      };
  
      const CountBtn = () => {
        const [, actions] = getStore('test');
        
        expect(actions.add).toBeTruthy();
  
        return <button data-testid="btn" onClick={actions.add}>add</button>;
      };

      const Test = () => <Provider models={[ model ]}><App /></Provider>;

      const { getByTestId } = render(<Test />);

      expect(getByTestId('count').textContent).toEqual('count:0');
      fireEvent.click(getByTestId('btn'));
      await act(async () => {
        await wait(10);
      });
      expect(getByTestId('count').textContent).toEqual('count:1');
    });
  });
});
