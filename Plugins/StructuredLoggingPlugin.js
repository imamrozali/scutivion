const FrameworkPlugin = require('./FrameworkPlugin');

class StructuredLoggingPlugin extends FrameworkPlugin {
  constructor() {
    super('logging');
    this.registerHook('onRequest', (ctx) => {
      console.log(`${ctx.method} ${ctx.url}`);
    });
    this.registerHook('onResponse', (ctx) => {
      console.log(`Response ${ctx.statusCode}`);
    });
    this.registerHook('onError', (ctx) => {
      console.error(`Error: ${ctx.error.message}`);
    });
  }
}

module.exports = StructuredLoggingPlugin;