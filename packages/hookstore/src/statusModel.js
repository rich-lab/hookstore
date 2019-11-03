export const ACTION_STATUS_NAME = '@STATUS';
export const DEFAULT_STATUS = { pending: false, error: null };

export const actionStatusModel = {
  name: ACTION_STATUS_NAME,
  state: {},
  actions: {
    set(actionWithName, status) {
      const { state } = this.ctx;

      state[actionWithName] = status;
    },
  },
};
