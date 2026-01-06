/// <reference path="../index.d.ts" />
const { CoreEngine, HTTPAdapter, LoggingPlugin } = require('scutivion');

const app = new CoreEngine({ cluster: true, poolSize: 2000 }); // Cluster-ready, larger pool

app.registerProtocol('http', new HTTPAdapter());

const logger = new LoggingPlugin();
logger.apply(app);

app.registerService('db', { query: () => 'data from DB' });

app.route('GET', '/', (ctx) => {
  ctx.responseBody = JSON.stringify({ message: 'Hello from BadakUltra', timestamp: Date.now() });
});

app.route('GET', '/users/:id', (ctx) => {
  const user = { id: ctx.params[0], name: 'User ' + ctx.params[0] };
  ctx.responseBody = JSON.stringify(user);
  ctx.responseHeaders['Content-Type'] = 'application/json';
});

app.route('POST', '/users', (ctx) => {
  // Simulate body parsing (in real app, use stream)
  ctx.responseBody = JSON.stringify({ created: true, id: Math.random() });
  ctx.statusCode = 201;
  ctx.responseHeaders['Content-Type'] = 'application/json';
});

app.hook('onRequest', (ctx) => {
  console.log(`Request: ${ctx.method} ${ctx.url}`);
});

app.hook('onResponse', (ctx) => {
  if (ctx.res) {
    ctx.res.writeHead(ctx.statusCode || 200, ctx.responseHeaders || {});
    ctx.res.end(ctx.responseBody || 'OK');
  }
});

app.listen('http', 3000);
console.log('REST API running on port 3000 with cluster support');