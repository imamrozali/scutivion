const { EventEmitter } = require('events');
const TrieRouter = require('../Router/TrieRouter');

class UnifiedEngineCore extends EventEmitter {
  /** @param {Object} [options] @param {number} [options.poolSize=1000] */
  constructor(options = {}) {
    super();
    this.router = new TrieRouter();
    this.hooks = new (require('./HookSystem'))();
    this.contextPool = new (require('./ContextPool'))(options.poolSize || 1000);
    this.services = {};
    this.protocols = {};
    this.circuitBreaker = { failures: 0, threshold: 5, timeout: 10000, lastFailure: 0 };
    this.isShuttingDown = false;

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /** @param {string} name @param {*} service */
  registerService(name, service) {
    this.services[name] = service;
  }

  /** @param {string} method @param {string} path @param {Function} handler */
  route(method, path, handler) {
    this.router.insert(method, path, handler);
  }

  /** @param {'onRequest'|'onResponse'|'onError'} hookName @param {Function} fn */
  hook(hookName, fn) {
    this.hooks.register(hookName, fn);
  }

  /** @param {string} protocol @param {*} rawReq @param {*} rawRes @param {import('net').Socket} [socket] */
  async handleRequest(protocol, rawReq, rawRes, socket = null) {
    if (this.isShuttingDown) return;

    try {
      this.checkCircuitBreaker();

      const ctx = this.contextPool.acquire();
    ctx.protocol = protocol;
    ctx.req = rawReq;
    ctx.res = rawRes;
    ctx.socket = socket;

    if (protocol === 'http' || protocol === 'http2') {
      ctx.method = rawReq.method;
      ctx.url = rawReq.url;
      ctx.headers = rawReq.headers;
    }

    this.hooks.execute('onRequest', ctx);

    if (ctx.method && ctx.url) {
      const path = ctx.url.split('?')[0];
      const handler = this.router.lookup(ctx.method, path, ctx.params);
      if (handler) {
        try {
          handler(ctx);
        } catch (err) {
          ctx.error = err;
          this.hooks.execute('onError', ctx);
        }
      } else {
        ctx.statusCode = 404;
      }
    }

    this.hooks.execute('onResponse', ctx);

      this.emit('response', ctx);

      this.contextPool.release(ctx);
    } catch (err) {
      console.error('Request handling error:', err);
      this.recordFailure();
    }
  }

  /** @param {string} protocol @param {number} port @param {Object} [options] */
  listen(protocol, port, options = {}) {
    const adapter = this.protocols[protocol];
    if (!adapter) throw new Error(`Protocol ${protocol} not registered`);
    adapter.listen(this, port, options);
  }

  /** @param {string} name @param {*} adapter */
  registerProtocol(name, adapter) {
    this.protocols[name] = adapter;
  }

  /** Circuit breaker check */
  checkCircuitBreaker() {
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      const now = Date.now();
      if (now - this.circuitBreaker.lastFailure < this.circuitBreaker.timeout) {
        throw new Error('Circuit breaker open');
      } else {
        this.circuitBreaker.failures = 0; // Reset
      }
    }
  }

  /** Record failure for circuit breaker */
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
  }

  /** Graceful shutdown */
  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    console.log('Shutting down gracefully...');
    // Close all protocols
    for (const adapter of Object.values(this.protocols)) {
      if (adapter.close) adapter.close();
    }
    // Release pools
    this.contextPool = null;
    process.exit(0);
  }
}

module.exports = UnifiedEngineCore;