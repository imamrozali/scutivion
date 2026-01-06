/// <reference path="../index.d.ts" />
const { CoreEngine, UDPAdapter } = require('scutivion');

const app = new CoreEngine();
app.registerProtocol('udp', new UDPAdapter());

app.route('UDP', '/echo', (ctx) => {
  const message = ctx.req.body.toString();
  ctx.res.send(Buffer.from('UDP Echo: ' + message));
});

app.route('UDP', '/ping', (ctx) => {
  ctx.res.send(Buffer.from('UDP Pong'));
});

app.hook('onError', (ctx) => {
  console.error(`UDP Error: ${ctx.error.message}`);
});

app.listen('udp', 3003);
console.log('UDP low-latency server on port 3003');