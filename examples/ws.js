/// <reference path="../index.d.ts" />
const { CoreEngine, WSAdapter } = require('scutivion');

const app = new CoreEngine({ poolSize: 1200 }); // Pool for WS

app.registerProtocol('ws', new WSAdapter());

app.route('WS', '/', (ctx) => {
  const message = ctx.req.body.toString();
  if (message === 'ping') {
    ctx.res.send(Buffer.from('pong'));
  } else {
    ctx.res.send(Buffer.from('Echo: ' + message));
  }
});

app.route('WS', '/chat', (ctx) => {
  const message = ctx.req.body.toString();
  ctx.res.send(Buffer.from(`Chat: ${message}`));
});

app.hook('onRequest', (ctx) => {
  console.log(`WS request on ${ctx.url}`);
});

app.listen('ws', 3002);
console.log('WebSocket server running on port 3002 with frame parsing and zero-copy');