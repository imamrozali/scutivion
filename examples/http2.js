/// <reference path="../index.d.ts" />
const { CoreEngine, HTTP2Adapter } = require('scutivion');

const app = new CoreEngine();
app.registerProtocol('http2', new HTTP2Adapter({ allowHTTP1: true }));

app.route('GET', '/push', async (ctx) => {
  // Server push example
  if (ctx.stream) {
    ctx.stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      if (!err) {
        pushStream.end('body { background: red; }');
      }
    });
  }
  ctx.responseBody = '<html><link rel="stylesheet" href="/style.css"><body>Pushed CSS!</body></html>';
});

app.hook('onResponse', (ctx) => {
  if (ctx.stream) {
    ctx.stream.respond({ 'content-type': 'text/html', ':status': 200 });
    ctx.stream.end(ctx.responseBody);
  }
});

app.listen('http2', 3000);
console.log('HTTP/2 server push example on port 3000');