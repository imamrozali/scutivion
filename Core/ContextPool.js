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

class ContextObjectPool {
  /** @param {number} [size=1000] */
  constructor(size = 1000) {
    this.pool = [];
    this.bufferPool = [];
    this.size = size;
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createContext());
      this.bufferPool.push(Buffer.alloc(4096));
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

  acquireBuffer() {
    return this.bufferPool.pop() || Buffer.alloc(4096);
  }

  releaseBuffer(buf) {
    if (this.bufferPool.length < this.size) {
      this.bufferPool.push(buf);
    }
  }
}

module.exports = ContextObjectPool;