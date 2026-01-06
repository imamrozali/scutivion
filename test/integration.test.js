const { expect } = require('chai');
const { UnifiedEngineCore, HTTPProtocolAdapter, StructuredLoggingPlugin } = require('../');

describe('Integration', () => {
  it('should setup full app', () => {
    const app = new UnifiedEngineCore();
    app.registerProtocol('http', new HTTPProtocolAdapter());
    const logger = new StructuredLoggingPlugin();
    logger.apply(app);
    app.registerService('db', { query: () => 'data' });
    app.route('GET', '/', (ctx) => {
      ctx.responseBody = 'Hello';
    });
    expect(app.protocols.http).to.be.instanceOf(HTTPProtocolAdapter);
    expect(app.services.db.query()).to.equal('data');
  });
});