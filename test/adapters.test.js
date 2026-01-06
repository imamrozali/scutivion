const { expect } = require('chai');
const HTTPProtocolAdapter = require('../Protocols/HTTPProtocolAdapter');
const TCPProtocolAdapter = require('../Protocols/TCPProtocolAdapter');
const WebSocketProtocolAdapter = require('../Protocols/WebSocketProtocolAdapter');

describe('HTTPProtocolAdapter', () => {
  it('should instantiate', () => {
    const adapter = new HTTPProtocolAdapter();
    expect(adapter).to.be.instanceOf(HTTPProtocolAdapter);
  });
});

describe('TCPProtocolAdapter', () => {
  it('should instantiate', () => {
    const adapter = new TCPProtocolAdapter();
    expect(adapter).to.be.instanceOf(TCPProtocolAdapter);
  });
});

describe('WebSocketProtocolAdapter', () => {
  it('should instantiate', () => {
    const adapter = new WebSocketProtocolAdapter();
    expect(adapter).to.be.instanceOf(WebSocketProtocolAdapter);
  });
});