class FrameworkPlugin {
  /** @param {string} name */
  constructor(name) {
    this.name = name;
    this.services = {};
    this.hooks = {};
  }

  /** @param {string} name @param {*} service */
  registerService(name, service) {
    this.services[name] = service;
  }

  /** @param {'onRequest'|'onResponse'|'onError'} hookName @param {Function} fn */
  registerHook(hookName, fn) {
    if (!this.hooks[hookName]) this.hooks[hookName] = [];
    this.hooks[hookName].push(fn);
  }

  /** @param {import('../Core/CoreEngine')} core */
  apply(core) {
    for (const [name, service] of Object.entries(this.services)) {
      core.registerService(name, service);
    }
    for (const [hookName, fns] of Object.entries(this.hooks)) {
      for (const fn of fns) {
        core.hook(hookName, fn);
      }
    }
  }
}

module.exports = FrameworkPlugin;