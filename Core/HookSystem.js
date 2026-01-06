class LifecycleHookSystem {
  constructor() {
    this.onRequest = [];
    this.onResponse = [];
    this.onError = [];
  }

  /** @param {'onRequest'|'onResponse'|'onError'} hookName @param {Function} fn */
  register(hookName, fn) {
    if (this[hookName]) {
      this[hookName].push(fn);
    }
  }

  /** @param {'onRequest'|'onResponse'|'onError'} hookName @param {Context} ctx */
  execute(hookName, ctx) {
    const hooks = this[hookName];
    if (!hooks) return;
    for (const hook of hooks) {
      try {
        hook(ctx);
      } catch (err) {
        if (hookName !== 'onError') {
          this.execute('onError', { ...ctx, error: err });
        }
      }
    }
  }

  async executeInline(hookName, ctx) {
    const hooks = this[hookName];
    if (!hooks) return;
    for (const hook of hooks) {
      await hook(ctx);
    }
  }
}

module.exports = LifecycleHookSystem;