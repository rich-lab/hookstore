// import expect from 'expect';
// import { renderHook, act } from '@testing-library/react-hooks';
import * as rtl from '@testing-library/react';
import { compose, checkModels, useForceRender } from '../src/util';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 1));

describe('util', () => {
  describe('#compose', () => {
    it('should work', async () => {
      const arr = [];
      const middlewares = [
        async (ctx, next) => {
          arr.push(1);
          ctx.state.arr.push(1);
          // console.log('-------before-----1');
          await wait(1);
          await next();
          await wait(1);
          // console.log('-------after-----1');
          ctx.state.arr.push(6);
          arr.push(6);
        },
        async (ctx, next) => {
          arr.push(2);
          ctx.state.arr.push(2);
          // console.log('-------before-----2');
          await wait(1);
          await next();
          await wait(1);
          arr.push(5);
          // console.log('-------after-----2');
          ctx.state.arr.push(5);
        },
      ];
      const lastFn = async ctx => {
        arr.push(3);
        ctx.state.arr.push(3);
        // console.log('-------before-----3');
        await wait(1);
        arr.push(4);
        // console.log('-------after-----3');
        ctx.state.arr.push(4);
      };

      const context = {
        namespace: 'test',
        action: 'compose',
        state: {
          arr: [],
        },
      };

      await compose(middlewares)(context, lastFn);

      expect(arr.join('')).toEqual([1, 2, 3, 4, 5, 6].join(''));
      expect(context.state.arr.join('')).toEqual([1, 2, 3, 4, 5, 6].join(''));
    });

    it('shoule throw', async () => {
      const middlewares = [
        async (ctx, next) => {
          ctx.state.x = 10;
          await next();
        },
        async (ctx, next) => {
          throw new Error('throw test');
        },
      ];
      const ctx = {
        state: { x: 1 },
      };
      const run = async () => {
        await compose(middlewares)(ctx);
      };

      await expect(run()).rejects.toMatchObject({ message: 'throw test' });
    });
  });

  describe('#checkModel', () => {
    const model = {
      namespace: 'a',
      state: {},
      actions: {},
    };

    it('should work', () => {
      expect(() => checkModels()).toThrow(/`model` or `models` required/);
      expect(() => checkModels({ model: 1 })).toThrow(/should be plain object/);
      expect(() => checkModels({ model: [] })).toThrow(/should be plain object/);
      expect(() => checkModels({ models: {} })).toThrow(/models should be array/);
      expect(() => checkModels({ models: [] })).toThrow(/at last one model/);
      expect(() => checkModels({ models: [{}] })).toThrow(/namespace is required/);
      expect(() => checkModels({ models: [() => {}] })).toThrow(/should be plain object/);
      expect(() => checkModels({ models: [{ namespace: '' }] })).toThrow(/namespace is required/);
      expect(() => checkModels({ models: [{ namespace: 1 }] })).toThrow(
        /namespace should be string/,
      );
      expect(() => checkModels({ models: [{ namespace: 'a', state: [] }] })).toThrow(
        /state should be plain object/,
      );
      expect(() => checkModels({ models: [{ namespace: 'a', actions: [] }] })).toThrow(
        /actions should be plain object/,
      );

      expect(() => checkModels({ model: { namespace: 'a' } })).not.toThrow();
      expect(() => checkModels({ model })).not.toThrow();
      expect(() => checkModels({ models: [model] })).not.toEqual();
      expect(() => checkModels({ models: [model], model })).not.toEqual();
    });
  });

  describe('forceRender', () => {
    it('should force re-render', async () => {
      let renderedItems = [];
      let forceRender;

      const App = () => {
        forceRender = useForceRender();

        renderedItems.push(1);

        return <div />;
      };

      rtl.render(<App />);

      expect(renderedItems).toEqual([1]);

      rtl.act(forceRender);
      expect(renderedItems).toEqual([1, 1]);
    });
  });
});
