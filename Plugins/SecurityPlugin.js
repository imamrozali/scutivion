const FrameworkPlugin = require('./FrameworkPlugin');

class SecurityPlugin extends FrameworkPlugin {
  constructor(options = {}) {
    super('security');
    this.rateLimit = options.rateLimit || 1000;
    this.requests = new Map();
  }

  async apply(core) {
    core.hook('onRequest', async (ctx) => {
      // Simple rate limiting
      const ip = ctx.socket?.remoteAddress || 'unknown';
      const now = Date.now();
      if (!this.requests.has(ip)) this.requests.set(ip, []);
      const times = this.requests.get(ip).filter(t => now - t < 60000); // Last minute
      if (times.length >= this.rateLimit) {
        ctx.statusCode = 429;
        ctx.responseBody = 'Rate limit exceeded';
        return;
      }
      times.push(now);
      this.requests.set(ip, times);
    });
  }
}

module.exports = SecurityPlugin;