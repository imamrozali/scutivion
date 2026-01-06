/// <reference path="../index.d.ts" />
const { CoreEngine, TCPAdapter } = require('scutivion');

const app = new CoreEngine({ poolSize: 1500 }); // Larger pool for TCP

app.registerProtocol('tcp', new TCPAdapter());

app.route('TCP', '/', (ctx) => {
  const message = ctx.req.body.toString();
  let response;
  if (message === 'ping') {
    response = 'pong';
  } else if (message.startsWith('echo ')) {
    response = message.substring(5);
  } else {
    response = 'Unknown command';
  }
  // Zero-copy: use buffer directly
  ctx.res.write(Buffer.from(response));
  ctx.res.end();
});

app.hook('onRequest', (ctx) => {
  console.log(`TCP request: ${ctx.req.body.length} bytes`);
});

app.listen('tcp', 3001);
console.log('TCP echo server running on port 3001 with zero-copy buffers');