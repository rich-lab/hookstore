export default {
  name: 'count',
  state: {
    count: 0,
    // foo: {
    //   bar: 1
    // },
  },
  actions: {
    nothing() {
      console.log('----------', this.ctx.state);
    },
    add(n) {
      const { state } = this.ctx;

      state.count += n;
    },
    addx(n) {
      const { state, actions } = this.ctx;

      state.count += n;

      actions.asyncAdd(n);
      // await actions.asyncAdd(n); // 如果需要同步执行，将addx函数改成aa即可，比saga的take('@end')好理解多了
    },
    async asyncAdd(n) {
      const { state } = this.ctx;
      // console.log('state before effect', state);

      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });

      state.count += n;

      // console.log('state after effect', state);
    },
    async printCountAsync() {
      const { getStore } = this.ctx;
      const [count1] = getStore('count', s => s.count);

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });

      const [count2] = getStore('count', s => s.count);
      console.log(`count1:${count1} count2:${count2}`);
    },
  },
};
