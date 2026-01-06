const { expect } = require('chai');
const ContextObjectPool = require('../Core/ContextPool');

describe('ContextObjectPool', () => {
  it('should acquire a context', () => {
    const pool = new ContextObjectPool(1);
    const ctx = pool.acquire();
    expect(ctx).to.be.an('object');
    expect(ctx.params).to.be.an('array');
  });

  it('should release a context', () => {
    const pool = new ContextObjectPool(1);
    const ctx = pool.acquire();
    ctx.custom.test = 'value';
    pool.release(ctx);
    const ctx2 = pool.acquire();
    expect(ctx2.custom.test).to.be.undefined;
  });

  it('should acquire and release buffer', () => {
    const pool = new ContextObjectPool(1);
    const buf = pool.acquireBuffer();
    expect(buf).to.be.instanceOf(Buffer);
    pool.releaseBuffer(buf);
  });
});