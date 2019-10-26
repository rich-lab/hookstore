export default {
  namespace: 'common',
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
    setName(ctx, name) {
      const { state } = ctx;

      state.nested.name = name;
    },

    async setLevel(ctx, level) {
      const { state } = ctx;

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });

      state.nested.foo.level = level;
    },
  },
};
