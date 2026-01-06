const { expect } = require('chai');
const FrameworkPlugin = require('../Plugins/FrameworkPlugin');
const StructuredLoggingPlugin = require('../Plugins/StructuredLoggingPlugin');
const ResponseCompressionPlugin = require('../Plugins/ResponseCompressionPlugin');
const ObservabilityPlugin = require('../Plugins/ObservabilityPlugin');

describe('FrameworkPlugin', () => {
  it('should register service and hook', () => {
    const plugin = new FrameworkPlugin('test');
    plugin.registerService('service', { data: 'test' });
    plugin.registerHook('onRequest', () => {});
    expect(plugin.services.service.data).to.equal('test');
    expect(plugin.hooks.onRequest).to.have.lengthOf(1);
  });
});

describe('StructuredLoggingPlugin', () => {
  it('should have logging hooks', () => {
    const plugin = new StructuredLoggingPlugin();
    expect(plugin.hooks.onRequest).to.have.lengthOf(1);
    expect(plugin.hooks.onResponse).to.have.lengthOf(1);
    expect(plugin.hooks.onError).to.have.lengthOf(1);
  });
});

describe('ResponseCompressionPlugin', () => {
  it('should instantiate', () => {
    const plugin = new ResponseCompressionPlugin();
    expect(plugin).to.be.instanceOf(ResponseCompressionPlugin);
  });
});

describe('ObservabilityPlugin', () => {
  it('should have metrics', () => {
    const plugin = new ObservabilityPlugin();
    expect(plugin.metrics).to.have.property('requests');
  });
});