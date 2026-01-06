/// <reference path="../index.d.ts" />
const { CoreEngine, HTTP2Adapter, WSAdapter, TCPAdapter, UDPAdapter, SecurityPlugin, CompressionPlugin, LoggingPlugin, StreamingPlugin, ObservabilityPlugin } = require('scutivion');

const app = new CoreEngine({ cluster: true, poolSize: 2000 });

app.registerProtocol('http2', new HTTP2Adapter());
app.registerProtocol('ws', new WSAdapter());
app.registerProtocol('tcp', new TCPAdapter());
app.registerProtocol('udp', new UDPAdapter());

// Plugins
app.registerPlugin(new SecurityPlugin({ rateLimit: 1000, cors: true }));
app.registerPlugin(new CompressionPlugin());
app.registerPlugin(new LoggingPlugin(console.log));
app.registerPlugin(new StreamingPlugin());
app.registerPlugin(new ObservabilityPlugin());

// Routes
app.route('GET', '/', (ctx) => {
  ctx.responseBody = JSON.stringify({ message: 'Full app with all plugins', time: Date.now() });
});

app.route('GET', '/health', (ctx) => {
  ctx.responseBody = JSON.stringify({ status: 'ok' });
});

app.route('GET', '/metrics', (ctx) => {
  // Metrics from ObservabilityPlugin
  ctx.responseBody = JSON.stringify({ requests: 100, errors: 0 });
});

app.route('POST', '/upload', (ctx) => {
  // StreamingPlugin handles large uploads
  ctx.responseBody = JSON.stringify({ uploaded: true });
});

app.route('WS', '/chat', (ctx) => {
  ctx.res.send(Buffer.from('Welcome to chat'));
});

app.route('TCP', '/echo', (ctx) => {
  ctx.res.write(ctx.req.body);
});

app.route('UDP', '/ping', (ctx) => {
  ctx.res.send(Buffer.from('pong'));
});

// Hooks
app.hook('onRequest', (ctx) => console.log(`Request: ${ctx.method} ${ctx.url}`));
app.hook('onResponse', (ctx) => console.log(`Response: ${ctx.statusCode}`));
app.hook('onError', (ctx) => console.error(`Error: ${ctx.error.message}`));

// Start all
app.listen('http2', 3000);
app.listen('ws', 3001);
app.listen('tcp', 3002);
app.listen('udp', 3003);

console.log('Full app running: HTTP2 on 3000, WS on 3001, TCP on 3002, UDP on 3003');