const FrameworkPlugin = require('./FrameworkPlugin');
const zlib = require('zlib');

class ResponseCompressionPlugin extends FrameworkPlugin {
  constructor() {
    super('compression');
  }

  async apply(core) {
    core.hook('onResponse', async (ctx) => {
      if (ctx.responseBody && ctx.headers['accept-encoding']?.includes('gzip')) {
        ctx.responseBody = await new Promise((resolve, reject) => {
          zlib.gzip(Buffer.from(ctx.responseBody), (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        ctx.headers['content-encoding'] = 'gzip';
      }
    });
  }
}

module.exports = ResponseCompressionPlugin;