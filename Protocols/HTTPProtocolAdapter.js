const http = require('http');
const http2 = require('http2');

class HTTPProtocolAdapter {
  /** @param {Object} [options] */
  constructor(options = {}) {
    this.http1Server = null;
    this.http2Server = null;
    this.options = options;
  }

  /** @param {import('../Core/CoreEngine')} core @param {number} port @param {Object} [opts] */
  listen(core, port, opts = {}) {
    if (opts.http2) {
      this.http2Server = http2.createServer(opts, (req, res) => {
        core.handleRequest('http2', req, res);
      });
      this.http2Server.listen(port);
    } else {
      this.http1Server = http.createServer((req, res) => {
        core.handleRequest('http', req, res);
      });
      this.http1Server.listen(port);
    }
  }

  close() {
    if (this.http1Server) this.http1Server.close();
    if (this.http2Server) this.http2Server.close();
  }
}

module.exports = HTTPProtocolAdapter;