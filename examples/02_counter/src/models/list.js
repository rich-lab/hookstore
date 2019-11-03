export default {
  name: 'list',
  state: {
    loading: false,
    list: [],
  },
  actions: {
    setLoading(loading) {
      const { state } = this.ctx;

      state.loading = loading;
    },
    async addItems(len) {
      const { state /*, flush*/ } = this.ctx;

      // if (state.loading) return;

      // state.loading = true;
      // flush();

      const newList = await fetchList(len);

      // state.loading = false;
      state.list = newList;
    },

    async addByCount() {
      const { state /*, actions*/, getStore } = this.ctx;
      // const { getState, actions: countActions } = getStore('count');
      // const count = getState(s => s.count);

      const [count, countActions] = getStore('count', s => s.count);

      // if (state.loading) return;

      if (count <= 0) return console.warn(`count ${count}!`);

      // commit({ loading: true });
      // actions.setLoading(true);
      const newList = await fetchList(count);

      // actions.setLoading(false);
      // state.loading = false;
      state.list = newList;
      countActions.add(1);
    },

    nothing() {
      console.log('------------>', this.ctx.state);
    },
  },
};

function fetchList(len) {
  // console.log('--------------FETCH-------------');
  return new Promise(resolve => {
    setTimeout(() => {
      const list = [];

      while (len) {
        list.push({ name: `item number ${(Math.random() * 10).toFixed(3)}` });
        len--;
      }

      resolve(list);
    }, 3000);
  });
}
