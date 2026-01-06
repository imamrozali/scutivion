const dgram = require('dgram');

class UDPProtocolAdapter {
  constructor(options = {}) {
    this.server = dgram.createSocket('udp4');
  }

  async listen(core, port) {
    this.server.on('message', async (msg, rinfo) => {
      const ctx = core.pool.acquire();
      ctx.rinfo = rinfo;
      await core.handleRequest('udp', { method: 'UDP', url: '/', headers: {}, body: msg }, {
        send: (data) => this.server.send(data, rinfo.port, rinfo.address)
      });
    });

    this.server.on('error', (err) => {
      console.error('UDP error:', err);
    });

    this.server.bind(port);
  }

  close() {
    this.server.close();
  }
}

module.exports = UDPProtocolAdapter;