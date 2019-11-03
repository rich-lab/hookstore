export default {
  name: 'common',
  state: {
    nested: {
      name: 'react',
      foo: {
        bar: 'biz',
        level: 1,
      },
    },
    other: 'anything',
  },
  actions: {
    setName(name) {
      const { state } = this.ctx;

      state.nested.name = name;
    },

    async setLevel(level) {
      const { state } = this.ctx;

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });

      state.nested.foo.level = level;
    },
  },
};
