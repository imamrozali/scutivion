const { EventEmitter } = require('events');
const Router = require('../Router');

/** @typedef {Object} Context
 * @property {import('http').IncomingMessage|import('http2').Http2ServerRequest} [req]
 * @property {import('http').ServerResponse|import('http2').Http2ServerResponse} [res]
 * @property {string[]} params
 * @property {Object.<string, string>} query
 * @property {*} [body]
 * @property {import('net').Socket} [socket]
 * @property {string} [protocol]
 * @property {string} [method]
 * @property {string} [url]
 * @property {Object.<string, string>} headers
 * @property {number} statusCode
 * @property {Object.<string, string>} responseHeaders
 * @property {string|Buffer} [responseBody]
 * @property {Error} [error]
 * @property {Object.<string, *>} custom
 */

class ContextPool {
  /** @param {number} [size=1000] */
  constructor(size = 1000) {
    this.pool = [];
    this.size = size;
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createContext());
    }
  }

  /** @returns {Context} */
  createContext() {
    return {
      req: null,
      res: null,
      params: [],
      query: {},
      body: null,
      socket: null,
      protocol: null,
      method: null,
      url: null,
      headers: {},
      statusCode: 200,
      responseHeaders: {},
      responseBody: null,
      error: null,
      custom: {}
    };
  }

  /** @returns {Context} */
  acquire() {
    return this.pool.pop() || this.createContext();
  }

  /** @param {Context} ctx */
  release(ctx) {
    ctx.req = null;
    ctx.res = null;
    ctx.params.length = 0;
    ctx.query = {};
    ctx.body = null;
    ctx.socket = null;
    ctx.protocol = null;
    ctx.method = null;
    ctx.url = null;
    ctx.headers = {};
    ctx.statusCode = 200;
    ctx.responseHeaders = {};
    ctx.responseBody = null;
    ctx.error = null;
    ctx.custom = {};
    if (this.pool.length < this.size) {
      this.pool.push(ctx);
    }
  }
}

class HookSystem {
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
}

class CoreEngine extends EventEmitter {
  /** @param {Object} [options] @param {number} [options.poolSize=1000] */
  constructor(options = {}) {
    super();
    this.router = new Router();
    this.hooks = new HookSystem();
    this.contextPool = new ContextPool(options.poolSize || 1000);
    this.services = {};
    this.protocols = {};
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
  handleRequest(protocol, rawReq, rawRes, socket = null) {
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
}

module.exports = CoreEngine;