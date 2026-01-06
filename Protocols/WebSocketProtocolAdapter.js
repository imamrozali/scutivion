const crypto = require('crypto');

class WebSocketProtocolAdapter {
  /** @param {Object} [options] */
  constructor(options = {}) {
    this.options = options;
  }

  /** @param {import('../Core/CoreEngine')} core @param {number} port */
  listen(core, port) {
    const http = require('http');
    this.server = http.createServer((req, res) => {
      if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        this.handleUpgrade(req, res, core);
      } else {
        core.handleRequest('http', req, res);
      }
    });
    this.server.listen(port);
  }

  /** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res @param {import('../Core/CoreEngine')} core */
  handleUpgrade(req, res, core) {
    const key = req.headers['sec-websocket-key'];
    const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    res.writeHead(101, {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': accept
    });
    res.end();

    const socket = req.socket;
    let buffer = Buffer.alloc(0);

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
      buffer = this.parseFrames(buffer, (frame) => {
        if (frame.opcode === 1 || frame.opcode === 2) { // Text or Binary
          const req = { method: 'WS', url: '/', headers: {}, body: frame.payload };
          const res = {
            send: (data) => process.nextTick(() => this.sendFrame(socket, frame.opcode === 2 ? 2 : 1, data)),
            close: () => socket.end()
          };
          core.handleRequest('ws', req, res, socket);
        }
      });
    });
  }

  /** @param {Buffer} buffer @param {Function} onFrame @returns {Buffer} */
  parseFrames(buffer, onFrame) {
    let offset = 0;
    while (offset < buffer.length) {
      if (buffer.length - offset < 2) break;
      const byte1 = buffer[offset++];
      const byte2 = buffer[offset++];
      const fin = (byte1 & 0x80) !== 0;
      const opcode = byte1 & 0x0F;
      const masked = (byte2 & 0x80) !== 0;
      let length = byte2 & 0x7F;

      if (length === 126) {
        if (buffer.length - offset < 2) break;
        length = buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (buffer.length - offset < 8) break;
        length = buffer.readUInt32BE(offset) * 0x100000000 + buffer.readUInt32BE(offset + 4);
        offset += 8;
      }

      if (masked) {
        if (buffer.length - offset < 4) break;
        const mask = buffer.slice(offset, offset + 4);
        offset += 4;
      }

      if (buffer.length - offset < length) break;

      let payload = buffer.slice(offset, offset + length);
      offset += length;

      if (masked) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i % 4];
        }
      }

      onFrame({ opcode, payload, fin });
    }
    return buffer.slice(offset);
  }

  /** @param {import('net').Socket} socket @param {number} opcode @param {Buffer} payload */
  sendFrame(socket, opcode, payload) {
    const frame = Buffer.alloc(2 + payload.length);
    frame[0] = 0x80 | opcode;
    frame[1] = payload.length;
    payload.copy(frame, 2);
    socket.write(frame);
  }

  close() {
    if (this.server) this.server.close();
  }
}

module.exports = WebSocketProtocolAdapter;