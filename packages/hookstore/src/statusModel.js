export const ACTION_STATUS_NAMESPACE = '@STATUS';
export const DEFAULT_STATUS = { pending: false, error: null };

export const actionStatusModel = {
  namespace: ACTION_STATUS_NAMESPACE,
  state: {},
  actions: {
    set(key, status) {
      const { state } = this.ctx;

      state[key] = status;
    },
  },
};
