import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { Provider, useStore } from '../src/provider';
import { getStore } from '../src/context';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 1));
const getItems = async (len) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = [];

      while (len) {
        list.push(`${(Math.random() * 10).toFixed(3)}`);
        len--;
      }

      resolve(list);
    }, 100);
  });
};

describe('#advanced usage', () => {
  afterEach(cleanup);
  
  it('call action between actions should work', async () => {
    const countModel = {
      name: 'count',
      state: {
        count: 0
      },
      actions: {
        add(n) {
          this.ctx.state.count += n;
        },
        addx(n) {
          const { state, actions } = this.ctx;

          state.count += n;

          actions.asyncAdd(n);
        },
        async asyncAdd(n) {
          const { state } = this.ctx;
    
          await wait(10);
    
          state.count += n;
        },
      }
    };
    const listModel = {
      name: 'list',
      state: {
        list: []
      },
      actions: {
        async addByCount() {
          const { state, getStore } = this.ctx;
          const [ count, countActions ] = getStore('count', s => s.count);
    
          if (count <= 0) throw new Error('count illegal');
          
          const newList = await getItems(count);
    
          state.list = newList;
          countActions.add(10);
        },
      },
    };
    const Counter = () => {
      const [ state, actions ] = useStore('count');
      const { count } = state;

      return (
        <>
          <div data-testid="count">count:{count}</div>
          <button data-testid="addx" onClick={() => actions.addx(1)}>Addx 1</button>
        </>
      );
    };
    const List = () => {
      const [ { count } ] = useStore('count');
      const [ { list }, actions ] = useStore('list');

      return (
        <>
          <div data-testid="list-count">count:{count}</div>
          <div data-testid="list" onClick={actions.addByCount}>listLen:{list.length}</div>
        </>
      );
    };
    const App = () => {
      return (
        <Provider models={[ countModel, listModel ]}>
          <Counter />
          <List />
        </Provider>
      );
    };
    const { getByTestId } = render(<App />);
    const [, { addByCount }] = getStore('list');
    let countNode = getByTestId('count');
    let listCountNode = getByTestId('list-count');
    let listNode = getByTestId('list');

    expect(countNode.textContent).toEqual('count:0');
    expect(listCountNode.textContent).toEqual('count:0');
    expect(listNode.textContent).toEqual('listLen:0');

    // @see https://github.com/facebook/jest/issues/3601
    await expect(addByCount()).rejects.toMatchObject({ message: 'count illegal' });

    fireEvent.click(getByTestId('addx'));

    [ countNode, listCountNode, listNode ] = await waitForElement(() => {
      return [ getByTestId('count'), getByTestId('list-count'), getByTestId('list') ];
    });

    expect(countNode.textContent).toEqual('count:1');
    expect(listCountNode.textContent).toEqual('count:1');
    expect(listNode.textContent).toEqual('listLen:0');

    await act(async() => await wait(30));

    [ countNode, listCountNode, listNode ] = await waitForElement(() => {
      return [ getByTestId('count'), getByTestId('list-count'), getByTestId('list') ];
    });

    expect(countNode.textContent).toEqual('count:2');
    expect(listCountNode.textContent).toEqual('count:2');
    expect(listNode.textContent).toEqual('listLen:0');

    fireEvent.click(getByTestId('list'));

    // wait for async rendering
    await act(async () => await wait(200));
    
    [ countNode, listCountNode, listNode ] = await waitForElement(() => {
      return [ getByTestId('count'), getByTestId('list-count'), getByTestId('list') ];
    });

    expect(countNode.textContent).toEqual('count:12');
    expect(listCountNode.textContent).toEqual('count:12');
    expect(listNode.textContent).toEqual('listLen:2');
  });
});
