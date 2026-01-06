const net = require('net');

class TCPAdapter {
  /** @param {Object} [options] */
  constructor(options = {}) {
    this.server = null;
    this.options = options;
  }

  /** @param {import('../Core')} core @param {number} port */
  listen(core, port) {
    this.server = net.createServer((socket) => {
      let buffer = Buffer.alloc(0);
      socket.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
        while (buffer.length >= 4) {
          const length = buffer.readUInt32BE(0);
          if (buffer.length < 4 + length) break;
          const message = buffer.slice(4, 4 + length);
          buffer = buffer.slice(4 + length);

          const req = { method: 'TCP', url: '/', headers: {}, body: message };
          const res = {
            write: (data) => socket.write(data),
            end: () => socket.end(),
            writeHead: () => {}
          };
          core.handleRequest('tcp', req, res, socket);
        }
      });
      socket.on('error', (err) => {
        console.error('TCP socket error:', err);
      });
    });
    this.server.listen(port);
  }

  close() {
    if (this.server) this.server.close();
  }
}

module.exports = TCPAdapter;