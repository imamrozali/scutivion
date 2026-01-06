// Main entry point for the Node.js High-Performance Framework

const UnifiedEngineCore = require('./Core/CoreEngine');
const HTTPProtocolAdapter = require('./Protocols/HTTPProtocolAdapter');
const TCPProtocolAdapter = require('./Protocols/TCPProtocolAdapter');
const WebSocketProtocolAdapter = require('./Protocols/WebSocketProtocolAdapter');
const HTTP2ProtocolAdapter = require('./Protocols/HTTP2ProtocolAdapter');
const UDPProtocolAdapter = require('./Protocols/UDPProtocolAdapter');
const FrameworkPlugin = require('./Plugins/FrameworkPlugin');
const StructuredLoggingPlugin = require('./Plugins/StructuredLoggingPlugin');
const SecurityPlugin = require('./Plugins/SecurityPlugin');
const ResponseCompressionPlugin = require('./Plugins/ResponseCompressionPlugin');
const FileStreamingPlugin = require('./Plugins/FileStreamingPlugin');
const ObservabilityPlugin = require('./Plugins/ObservabilityPlugin');

module.exports = {
  CoreEngine: UnifiedEngineCore, // Alias for compatibility
  UnifiedEngineCore,
  HTTPProtocolAdapter,
  HTTPAdapter: HTTPProtocolAdapter, // Alias
  TCPProtocolAdapter,
  TCPAdapter: TCPProtocolAdapter, // Alias
  WebSocketProtocolAdapter,
  WSAdapter: WebSocketProtocolAdapter, // Alias
  HTTP2ProtocolAdapter,
  UDPProtocolAdapter,
  FrameworkPlugin,
  Plugin: FrameworkPlugin, // Alias
  StructuredLoggingPlugin,
  LoggingPlugin: StructuredLoggingPlugin, // Alias
  SecurityPlugin,
  ResponseCompressionPlugin,
  CompressionPlugin: ResponseCompressionPlugin, // Alias
  FileStreamingPlugin,
  StreamingPlugin: FileStreamingPlugin, // Alias
  ObservabilityPlugin
};