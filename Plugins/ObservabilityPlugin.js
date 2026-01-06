const FrameworkPlugin = require('./FrameworkPlugin');

class ObservabilityPlugin extends FrameworkPlugin {
  constructor() {
    super('observability');
    this.metrics = { requests: 0, errors: 0 };
  }

  async apply(core) {
    core.route('GET', '/health', async (ctx) => {
      ctx.responseBody = JSON.stringify({ status: 'ok', uptime: process.uptime() });
    });
    core.route('GET', '/metrics', async (ctx) => {
      ctx.responseBody = JSON.stringify(this.metrics);
    });
    core.hook('onRequest', () => this.metrics.requests++);
    core.hook('onError', () => this.metrics.errors++);
  }
}

module.exports = ObservabilityPlugin;