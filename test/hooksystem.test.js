const { expect } = require('chai');
const LifecycleHookSystem = require('../Core/HookSystem');

describe('LifecycleHookSystem', () => {
  it('should register and execute hook', () => {
    const hooks = new LifecycleHookSystem();
    let called = false;
    hooks.register('onRequest', () => called = true);
    hooks.executeInline('onRequest', {});
    expect(called).to.be.true;
  });
});