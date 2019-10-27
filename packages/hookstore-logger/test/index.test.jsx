import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
// import { renderHook, act } from '@testing-library/react-hooks'
// import * as rtl from '@testing-library/react'
import mm from 'mm';

import createLogger from '../src';
import { Provider, applyMiddlewares, getActions } from '../../hookstore';

const model = {
  namespace: 'a',
  state: { n: 0, arr: [] },
  actions: {
    change() {
      this.ctx.state.n += 1;
    },
    add() {
      this.ctx.state.xx = 1;
    },
    del() {
      delete this.ctx.state.xx;
    },
    arr() {
      this.ctx.state.arr = [1];
    },
    nothing() {}
  }
};

describe('logger middleware', () => {
  let groups = [];
  let logs = [];
  let actions;

  function restore() {
    groups = [];
    logs = [];
  }

  function renderApp(options) {
    const Test = () => {
      applyMiddlewares([ createLogger(options) ]);
  
      return <Provider model={model}><div>test</div></Provider>;
    };
    render(<Test />);
  
    actions = getActions('a');
  }

  mm(console, 'group', (...args) => {
    groups = groups.concat(args);
  });
  mm(console, 'log', (...args) => {
    logs = logs.concat(args);
  });

  beforeEach(restore);
  afterEach(cleanup);

  it('should be ok', async () => {
    renderApp();

    await act(async () => await actions.change());

    expect(groups[0]).toMatch(/%ca\/change/);
    expect(logs[0]).toEqual('%cprev state');
    expect(logs[3]).toEqual('%cnext state');
  });

  describe('diff check', () => {
    it('changed should ok', async () => {
      renderApp({ showDiff: true });
  
      await act(async () => await actions.change());
      expect(groups[0]).toMatch(/%ca\/change/);
      expect(logs[3]).toEqual('%cCHANGED:');
    });
  
    it('added and deleted should be ok', async() => {
      renderApp({ showDiff: true });
      await act(async () => await actions.add());
      expect(groups[0]).toMatch(/%ca\/add/);
      expect(logs[3]).toEqual('%cADDED:');
      restore();

      await act(async () => await actions.del());
      expect(groups[0]).toMatch(/%ca\/del/);
      expect(logs[3]).toEqual('%cDELETED:');
    });
  
    it('array should be ok', async() => {
      renderApp({ showDiff: true });
      await act(async () => await actions.arr());
      expect(groups[0]).toMatch(/%ca\/arr/);
      expect(logs[3]).toEqual('%cARRAY:');
    });
  
    it('nothing todo should be ok', async() => {
      renderApp({ showDiff: true });
      await act(async () => await actions.nothing());
      expect(groups[0]).toMatch(/%ca\/nothing/);
      expect(logs[0]).toEqual('%cprev state');
      expect(logs[3]).toEqual('%cnext state');
    });
  });

  describe('took check', () => {
    it('should be ok', async () => {
      renderApp({ showTook: true });

      await act(async () => await actions.change());

      expect(groups[0]).toMatch(/\(in 0.00 ms\)/);
    });
  });
});
