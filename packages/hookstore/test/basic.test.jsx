import React from 'react';
import { render, fireEvent, waitForElement, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// import { getActions } from '../src/action';
import { Provider, useStore } from '../src/provider';
import { getStore } from '../src/context';
import { applyMiddlewares } from '../src/middlewares';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 1));

describe('#basic usage', () => {
  // let renderedItems = [];
  // let forceRender;

  // beforeEach(() => {
  //   forceRender = null;
  //   renderedItems = [];
  // });
  afterEach(cleanup);

  it('should throw', async () => {
    expect(() => useStore()).toThrow();
    expect(() => useStore('a')).toThrow();
  });

  it('single model should work', async () => {
    const jestFn = jest.fn();
    const model = {
      name: 'single',
      state: { a: 0, b: 0 },
      actions: {
        addA() {
          this.ctx.state.a += 1;
        }
      },
    };

    const App = () => {
      const [ { a }, actions ] = useStore('single');

      jestFn();

      return (
        <>
          <div data-testid="a" onClick={actions.addA}>a:{a}</div>
        </>
      );
    };

    const Test = () => <Provider model={model}><App /></Provider>;
    const { getByTestId } = render(<Test />);
    let aNode = getByTestId('a');
    
    expect(aNode.textContent).toEqual('a:0');
    expect(jestFn).toHaveBeenCalledTimes(1);

    fireEvent.click(aNode);

    aNode = await waitForElement(() => getByTestId('a'));

    expect(aNode.textContent).toEqual('a:1');
    expect(jestFn).toHaveBeenCalledTimes(2);
  });

  it('multiple model should work', async () => {
    const jestFn = jest.fn();
    const jestFnA = jest.fn();
    const jestFnB = jest.fn();
    const jestFnC = jest.fn();
    const modelA = {
      name: 'a',
      state: { a: 0 },
      actions: {
        addA() {
          this.ctx.state.a += 1;
        }
      },
    };
    const modelB = {
      name: 'b',
      state: { b: 0 },
      actions: {
        addB() {
          this.ctx.state.b += 1;
        }
      },
    };
    const A = () => {
      const [ { a }, actions ] = useStore('a');

      jestFnA();

      return <div data-testid="a" onClick={actions.addA}>a:{a}</div>;
    };
    const B = () => {
      const [ { b }, actions ] = useStore('b');

      jestFnB();

      return <div data-testid="b" onClick={actions.addB}>b:{b}</div>;
    };
    const C = () => {
      const [ { a } ] = useStore('a');
      const [ { b } ] = useStore('b');

      jestFnC();

      return <div data-testid="c">a:{a},b:{b}</div>;
    };

    const App = () => {
      jestFn();

      return (
        <>
          <A />
          <B />
          <C />
        </>
      );
    };

    const Test = () => <Provider models={[ modelA, modelB ]}><App /></Provider>;
    const { getByTestId } = render(<Test />);
    let aNode = getByTestId('a');
    let bNode = getByTestId('b');
    let cNode = getByTestId('c');
    
    expect(aNode.textContent).toEqual('a:0');
    expect(bNode.textContent).toEqual('b:0');
    expect(cNode.textContent).toEqual('a:0,b:0');
    expect(jestFn).toHaveBeenCalledTimes(1);
    expect(jestFnA).toHaveBeenCalledTimes(1);
    expect(jestFnB).toHaveBeenCalledTimes(1);
    expect(jestFnC).toHaveBeenCalledTimes(1);

    fireEvent.click(aNode);

    [ aNode, bNode, cNode ] = await waitForElement(() => [getByTestId('a'), getByTestId('b'), getByTestId('c')]);

    expect(aNode.textContent).toEqual('a:1');
    expect(bNode.textContent).toEqual('b:0');
    expect(cNode.textContent).toEqual('a:1,b:0');
    expect(jestFn).toHaveBeenCalledTimes(1);
    expect(jestFnA).toHaveBeenCalledTimes(2);
    expect(jestFnB).toHaveBeenCalledTimes(1);
    expect(jestFnC).toHaveBeenCalledTimes(2);

    fireEvent.click(bNode);
    [ aNode, bNode, cNode ] = await waitForElement(() => [getByTestId('a'), getByTestId('b'), getByTestId('c')]);

    expect(aNode.textContent).toEqual('a:1');
    expect(bNode.textContent).toEqual('b:1');
    expect(cNode.textContent).toEqual('a:1,b:1');
    expect(jestFn).toHaveBeenCalledTimes(1);
    expect(jestFnA).toHaveBeenCalledTimes(2);
    expect(jestFnB).toHaveBeenCalledTimes(2);
    expect(jestFnC).toHaveBeenCalledTimes(3);
  });

  it('async action should work', async () => {
    const jestFn = jest.fn();
    const model = {
      name: 'action',
      state: { a: 0, b: 0 },
      actions: {
        addA() {
          this.ctx.state.a += 1;
        },
        async addB() {
          this.ctx.state.a += 1;
          await wait(10);
          this.ctx.state.b += 1;
        }
      },
    };

    const App = () => {
      const [ { a, b }, actions ] = useStore('action');

      jestFn();

      return (
        <>
          <div data-testid="a" onClick={actions.addA}>a:{a}</div>
          <div data-testid="b" onClick={actions.addB}>b:{b}</div>
        </>
      );
    };

    const Test = () => <Provider model={model}><App /></Provider>;
    const { getByTestId } = render(<Test />);
    let aNode = getByTestId('a');
    const bNode = getByTestId('b');
    
    expect(aNode.textContent).toEqual('a:0');
    expect(bNode.textContent).toEqual('b:0');
    expect(jestFn).toHaveBeenCalledTimes(1);

    fireEvent.click(aNode);

    aNode = await waitForElement(() => getByTestId('a'));

    expect(aNode.textContent).toEqual('a:1');
    expect(jestFn).toHaveBeenCalledTimes(2);

    fireEvent.click(bNode);

    // @see https://github.com/facebook/react/issues/14769
    await act(async () => await wait(15));

    expect(aNode.textContent).toEqual('a:2');
    expect(bNode.textContent).toEqual('b:1');
    expect(jestFn).toHaveBeenCalledTimes(3);
  });

  it('middlewares shoule work', async () => {
    const model = {
      name: 'a',
      state: { a: 0, arr: [] },
      actions: {
        addA() {
          this.ctx.state.a += 1;
        }
      },
    };
    const middlewares = [
      async (ctx, next) => {
        ctx.state.arr.push(1);
        await next();
        ctx.state.arr.push(2);
      },
      async (ctx, next) => {
        ctx.state.arr.push(3);
        await next();
        ctx.state.arr.push(4);
      },
    ];

    const App = () => {
      const [ { a, arr }, actions ] = useStore('a');

      return (
        <>
          <div data-testid="a" onClick={actions.addA}>a:{a},arr:{arr.join(',')}</div>
        </>
      );
    };

    const Test = () => {
      applyMiddlewares(middlewares);

      return <Provider model={model} middlewares={middlewares}><App /></Provider>;
    };
    const { getByTestId } = render(<Test />);
    let aNode = getByTestId('a');

    expect(aNode.textContent).toEqual('a:0,arr:');

    fireEvent.click(aNode);

    aNode = await waitForElement(() => getByTestId('a'));

    expect(aNode.textContent).toEqual('a:1,arr:1,3,4,2');
  });

  it('action return value shoule work', async () => {
    const model = {
      name: 'a',
      state: { a: 0 },
      actions: {
        withRet() {
          return 1;
        },
        async asyncWithRet() {
          await wait(10);

          return 1;
        }
      },
    };
    const middlewares = [
      async (ctx, next) => {
        const r = await next();
        return r;
      },
    ];

    const App = () => {
      return <div>ttt</div>;
    };

    const Test = () => {
      applyMiddlewares(middlewares);

      return <Provider model={model}><App /></Provider>;
    };
    
    render(<Test />);

    const [, actions] = getStore('a');
    let ret, asyncRet;
    await act(async () => ret = await actions.withRet());
    await act(async () => asyncRet = await actions.asyncWithRet());

    // console.log('---------------', ret, asyncRet);
    expect(ret).toEqual(1);
    expect(asyncRet).toEqual(1);
  });

  it('complex state shoule work', async () => {
    let newName = '';
    let newLevel = 0;
    const model = {
      name: 'complex',
      state: { 
        name: 'foo', 
        nested: {
          level: 'basic',
          grade: {
            desc: 'description',
            value: 1,
          }
        },
      },
      actions: {
        setName(name) {
          this.ctx.state.name = name;
        },
        setGrade(value) {
          const { getStore } = this.ctx;
          const [ nested ] = getStore(s => s.nested);

          if (value >= 3) nested.level = 'normal';
          nested.grade.value = value;
        },
      },
    };

    const App = () => {
      const [ { name, nested }, actions ] = useStore('complex');
      const { value, desc } = nested.grade;
      const setName = () => actions.setName(newName);
      const setGrade = () => actions.setGrade(newLevel);

      return (
        <>
          <div data-testid="name" onClick={setName}>name:{name}</div>
          <div data-testid="level">level:{nested.level}</div>
          <div data-testid="grade" onClick={setGrade}>value:{value},desc:{desc}</div>
        </>
      );
    };

    const Test = () => <Provider model={model}><App /></Provider>;
    const { getByTestId } = render(<Test />);
    let nameNode = getByTestId('name');
    let levelNode = getByTestId('level');
    let gradeNode = getByTestId('grade');

    expect(nameNode.textContent).toEqual('name:foo');
    expect(levelNode.textContent).toEqual('level:basic');
    expect(gradeNode.textContent).toEqual('value:1,desc:description');

    newName = 'bar';
    fireEvent.click(nameNode);
    [ nameNode, levelNode, gradeNode ] = await waitForElement(() => {
      return [ getByTestId('name'), getByTestId('level'), getByTestId('grade') ];
    });

    expect(nameNode.textContent).toEqual('name:bar');
    expect(levelNode.textContent).toEqual('level:basic');
    expect(gradeNode.textContent).toEqual('value:1,desc:description');

    newLevel = 2;
    fireEvent.click(gradeNode);
    [ nameNode, levelNode, gradeNode ] = await waitForElement(() => {
      return [ getByTestId('name'), getByTestId('level'), getByTestId('grade') ];
    });

    expect(nameNode.textContent).toEqual('name:bar');
    expect(levelNode.textContent).toEqual('level:basic');
    expect(gradeNode.textContent).toEqual('value:2,desc:description');

    newLevel = 10;
    fireEvent.click(gradeNode);
    [ nameNode, levelNode, gradeNode ] = await waitForElement(() => {
      return [ getByTestId('name'), getByTestId('level'), getByTestId('grade') ];
    });

    expect(nameNode.textContent).toEqual('name:bar');
    expect(levelNode.textContent).toEqual('level:normal');
    expect(gradeNode.textContent).toEqual('value:10,desc:description');
  });

  it('state diff should work', async () => {
    const jestFn = jest.fn();
    const modelA = {
      name: 'a',
      state: {
        foo: {
          bar: 'aaa'
        },
        biz: 'ttt'
      },
      actions: {
        reWrite() {
          this.ctx.state.foo.bar = 'aaa';
          this.ctx.state.biz = 'ttt';
        }
      }
    };
    const A = () => {
      const [ { foo, biz }, actions ] = useStore('a');

      jestFn();

      return (
        <>
          <div data-testid="bar">bar:{foo.bar}</div>
          <div data-testid="biz">biz:{biz}</div>
          <button data-testid="rewrite" onClick={actions.reWrite}>reWrite</button>
        </>
      );
    };
    const App = () => {
      return (
        <Provider model={modelA}>
          <A />
        </Provider>
      );
    };
    const { getByTestId } = render(<App />);
    const barNode = getByTestId('bar');
    const bizNode = getByTestId('biz');

    expect(barNode.textContent).toEqual('bar:aaa');
    expect(bizNode.textContent).toEqual('biz:ttt');
    expect(jestFn).toHaveBeenCalledTimes(1);

    fireEvent.click(getByTestId('rewrite'));

    expect(barNode.textContent).toEqual('bar:aaa');
    expect(bizNode.textContent).toEqual('biz:ttt');
    expect(jestFn).toHaveBeenCalledTimes(1);
  });

  it('selector should work', async () => {
    const jestFn1 = jest.fn();
    const jestFn2 = jest.fn();
    const model = {
      name: 't',
      state: {
        a: 1,
        b: 10,
      },
      actions: {
        setA() { this.ctx.state.a = 2; }
      }
    };
    const B = React.memo(({ b }) => {
      jestFn2();

      return <div data-testid="b">b:{b}</div>;
    });
    const A = () => {
      const [ b, actions ] = useStore('t', s => s.b);

      jestFn1();

      return (
        <>
          <button data-testid="a" onClick={actions.setA}>setA</button>
          <B b={b} />
        </>
      );
    };
    const App = () => {
      return (
        <Provider model={model}>
          <A />
        </Provider>
      );
    };
    const { getByTestId } = render(<App />);
    const [ , actions ] = getStore('t');
    let bNode = getByTestId('b');

    expect(bNode.textContent).toEqual('b:10');
    expect(jestFn1).toHaveBeenCalledTimes(1);
    expect(jestFn2).toHaveBeenCalledTimes(1);

    act(() => {
      actions.setA();
    });

    expect(bNode.textContent).toEqual('b:10');
    expect(getStore('t', s => s.a)[0]).toEqual(2);
    expect(jestFn1).toHaveBeenCalledTimes(1);
    expect(jestFn2).toHaveBeenCalledTimes(1);
  });

  it('re-render should controlled', async () => {
    const jestFn1 = jest.fn();
    const jestFn2 = jest.fn();
    const model = {
      name: 'a',
      state: { a: 0 },
      actions: {
        add() { this.ctx.state.a += 1; },
        async asyncAdd() { 
          await wait(10); 
          this.ctx.state.a += 1;
        },
      },
    };
    const A = () => {
      const [ , actions ] = useStore('a');

      jestFn2();

      return <div data-testid="a2" onClick={actions.asyncAdd}>a2</div>;
    };
    const App = () => {
      const [ , actions ] = useStore('a');

      jestFn1();

      return (
        <>
          <div data-testid="a1" onClick={actions.add}>a1</div>
          <A />
        </>
      );
    };
    
    render(<Provider model={model}><App /></Provider>);

    const [, actions ] = getStore('a');

    expect(jestFn1).toHaveBeenCalledTimes(1);
    expect(jestFn2).toHaveBeenCalledTimes(1);

    await act(async () => { await actions.add() });
    expect(getStore('a', s => s.a)[0]).toEqual(1);
    expect(jestFn1).toHaveBeenCalledTimes(2);
    expect(jestFn2).toHaveBeenCalledTimes(2);

    await act(async () => { await actions.asyncAdd() });
    expect(getStore('a', s => s.a)[0]).toEqual(2);
    expect(jestFn1).toHaveBeenCalledTimes(3);
    expect(jestFn2).toHaveBeenCalledTimes(3);
  });

  it('access state between models shoule work', async () => {
    let count = 0;
    const modelA = {
      name: 'a',
      state: { arr: [] },
      actions: {
        pushArr(item) {
          this.ctx.state.arr.push(item);
        },
      }
    };
    const modelB = {
      name: 'b',
      state: { b: 0 },
      actions: {
        setB() {
          const { state, getStore } = this.ctx;
          const [ arr ] = getStore('a', s => s.arr);

          state.b = arr.length;
        },
      }
    };
    const App = () => {
      const [ { arr }, actions ] = useStore('a');
      const [ { b }, bActions ] = useStore('b');
      const push = () => {
        actions.pushArr(++count);
        bActions.setB();
      };

      return (
        <>
          <div data-testid="a" onClick={push}>arr:{arr.join(',')}</div>
          <div data-testid="b">b:{b}</div>
        </>
      );
    };
    const Test = () => <Provider models={[ modelA, modelB ]}><App /></Provider>;
    const { getByTestId } = render(<Test />);
    let aNode = getByTestId('a');
    let bNode = getByTestId('b');

    expect(aNode.textContent).toEqual('arr:');
    expect(bNode.textContent).toEqual('b:0');

    // double click
    fireEvent.click(aNode);
    fireEvent.click(aNode);
    [ aNode, bNode ] = await waitForElement(() => [ getByTestId('a'), getByTestId('b') ]);

    expect(aNode.textContent).toEqual('arr:1,2');
    expect(bNode.textContent).toEqual('b:2');
  });

  it('call action between actions should work', async () => {
    const countModel = {
      name: 'count',
      state: {
        count: 0
      },
      actions: {
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
    const App = () => {
      return (
        <Provider models={[ countModel ]}>
          <Counter />
        </Provider>
      );
    };
    const { getByTestId } = render(<App />);
    let countNode = getByTestId('count');

    expect(countNode.textContent).toEqual('count:0');

    fireEvent.click(getByTestId('addx'));

    countNode = await waitForElement(() => getByTestId('count'));

    expect(countNode.textContent).toEqual('count:1');

    // wait for async rendering
    await act(async () => await wait(50));

    countNode = await waitForElement(() => getByTestId('count'));

    expect(countNode.textContent).toEqual('count:2');
  });

  it('fresh should work', async () => {
    const jestFn = jest.fn();
    const modelList = {
      name: 'list',
      state: {
        loading: false,
        list: [],
      },
      actions: {
        async load() {
          const { state, fresh } = this.ctx;
          
          if (state.loading) return;

          state.loading = true;
          fresh('fresh state right now!');

          await wait(100);

          state.loading = false;
          state.list = [1, 2, 3];
        }
      },
    };
    const List = () => {
      const [ { loading, list }, actions ] = useStore('list');

      jestFn();

      return (
        <>
          <div data-testid="loading">{loading ? 'loading' : ''}</div>
          <div data-testid="list" onClick={actions.load}>{list.join(',')}</div>
        </>
      );
    };
    const App = () => {
      return <Provider models={[ modelList ]}><List /></Provider>;
    };
    const { getByTestId } = render(<App />);
    let aNode = getByTestId('loading');
    let bNode = getByTestId('list');

    expect(aNode.textContent).toEqual('');
    expect(bNode.textContent).toEqual('');
    expect(jestFn).toHaveBeenCalledTimes(1);

    fireEvent.click(bNode);

    [ aNode, bNode ] = await waitForElement(() => [ getByTestId('loading'), getByTestId('list') ]);

    expect(aNode.textContent).toEqual('loading');
    expect(bNode.textContent).toEqual('');
    expect(jestFn).toHaveBeenCalledTimes(2);

    await act(async () => await wait(100));

    expect(aNode.textContent).toEqual('');
    expect(bNode.textContent).toEqual('1,2,3');
    expect(jestFn).toHaveBeenCalledTimes(3);
  });
});
