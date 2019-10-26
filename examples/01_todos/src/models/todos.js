const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 1));

function find(list, { id, text, status }) {
  if (id) return list.find(item => item.id === id);
  if (text) return list.find(item => item.text === text);
  if (status !== undefined) return list.find(item => item.status === status);
  return null;
}

export default {
  namespace: 'todos',
  state: {
    list: [],
  },
  actions: {
    async add(text) {
      const { state } = this.ctx;

      await wait(1000);

      if (!find(state.list, { text })) {
        state.list.push({ id: Date.now(), text, status: 0 });
        return true;
      }

      return false;
    },
    async delete(id) {
      await wait(1000);

      const { state } = this.ctx;

      state.list = state.list.filter(item => item.id !== id);
    },
    toggle(id) {
      // await wait(1000);

      const { state } = this.ctx;
      const item = find(state.list, { id });

      if (item) {
        if (item.status === 1) item.status = 0;
        else item.status = 1;
      }
    },
  },
};
