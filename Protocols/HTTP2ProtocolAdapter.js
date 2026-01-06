const http2 = require('http2');

class HTTP2ProtocolAdapter {
  constructor(options = {}) {
    this.server = http2.createServer(options);
  }

  async listen(core, port) {
    this.server.on('stream', async (stream, headers) => {
      const ctx = core.pool.acquire();
      ctx.stream = stream;
      // Server push support
      ctx.pushStream = (pushHeaders, callback) => stream.pushStream(pushHeaders, callback);
      await core.handleRequest('http2', { method: headers[':method'], url: headers[':path'], headers }, {
        respond: (resHeaders) => stream.respond(resHeaders),
        end: (data) => stream.end(data)
      });
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = HTTP2ProtocolAdapter;