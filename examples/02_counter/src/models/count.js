export default {
  namespace: 'count',
  state: {
    count: 0,
    // foo: {
    //   bar: 1
    // },
  },
  actions: {
    nothing(ctx) {
      console.log('----------', ctx.state);
    },
    add(ctx, n) {
      const { state } = ctx;

      state.count += n;
    },
    addx(ctx, n) {
      const { state, actions } = ctx;

      state.count += n;

      actions.asyncAdd(n);
      // await actions.asyncAdd(n); // 如果需要同步执行，将addx函数改成aa即可，比saga的take('@end')好理解多了
    },
    async asyncAdd(ctx, n) {
      const { state } = ctx;
      // console.log('state before effect', state);

      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      state.count += n;

      // console.log('state after effect', state);
    },
    async printCountAsync(ctx) {
      const { getState } = ctx;
      const countState = getState('count');
      const count1 = countState.count;

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });

      // const countState = getState('count');
      console.log(`count1:${count1} count2:${countState.count}`);
    },
  },
};
