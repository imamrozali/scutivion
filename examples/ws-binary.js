/// <reference path="../index.d.ts" />
const { CoreEngine, WSAdapter } = require('scutivion');

const app = new CoreEngine();
app.registerProtocol('ws', new WSAdapter());

app.route('WS', '/binary', (ctx) => {
  if (ctx.req.body instanceof Buffer) {
    // Binary frame
    const response = Buffer.concat([Buffer.from('Binary echo: '), ctx.req.body]);
    ctx.res.send(response);
  } else {
    // Text frame
    ctx.res.send(Buffer.from('Text: ' + ctx.req.body));
  }
});

app.listen('ws', 3001);
console.log('WebSocket binary frames example on port 3001');