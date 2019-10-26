import { getActions } from 'hookstore';

// select('count', s => s.count);

export default {
  namespace: 'list',
  state: {
    loading: false,
    list: [],
  },
  actions: {
    setLoading(ctx, loading) {
      const { state } = ctx;

      state.loading = loading;
    },
    async addItems(ctx, len) {
      const { state, flush } = ctx;

      // if (state.loading) return;

      // state.loading = true;
      // flush();

      const newList = await fetchList(len);

      // state.loading = false;
      state.list = newList;
    },

    async addByCount(ctx) {
      const { state, getState, actions } = ctx;
      const count = getState('count', s => s.count);
      const countActions = getActions('count');

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

    nothing(ctx) {
      console.log('------------>', ctx.state);
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
