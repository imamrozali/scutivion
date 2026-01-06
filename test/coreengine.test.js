const { expect } = require('chai');
const TrieRouter = require('../Router/TrieRouter');
const LifecycleHookSystem = require('../Core/HookSystem');
const ContextObjectPool = require('../Core/ContextPool');
const UnifiedEngineCore = require('../Core/CoreEngine');

describe('UnifiedEngineCore', () => {
  it('should register service', () => {
    const engine = new UnifiedEngineCore();
    engine.registerService('test', { value: 42 });
    expect(engine.services.test.value).to.equal(42);
  });

  it('should register dynamic route', () => {
    const engine = new UnifiedEngineCore();
    const handler = () => {};
    engine.route('GET', '/users/:id', handler);
    const params = [];
    const found = engine.router.lookup('GET', '/users/123', params);
    expect(found).to.equal(handler);
    expect(params[0]).to.equal('123');
  });

  it('should register hook', () => {
    const engine = new UnifiedEngineCore();
    engine.hook('onRequest', () => {});
    expect(engine.hooks.onRequest).to.have.lengthOf(1);
  });
});