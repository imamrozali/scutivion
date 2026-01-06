// Benchmark script comparing Scutivion vs Fastify, Express, uWebSockets

const { CoreEngine, HTTPAdapter } = require('scutivion');
const autocannon = require('autocannon');
const { performance } = require('perf_hooks');

async function benchmarkFramework(name, setupFn, port) {
  console.log(`Benchmarking ${name}...`);
  const instance = await setupFn(port);

  const result = await autocannon({
    url: `http://localhost:${port}/`,
    connections: 10,
    pipelining: 1,
    duration: 10
  });

  console.log(`${name} - Requests/sec: ${result.requests.average}, Latency: ${result.latency.average}ms`);

  instance.close();
  return result;
}

async function setupHPF(port) {
  const app = new CoreEngine();
  app.registerProtocol('http', new HTTPAdapter());
  app.route('GET', '/', (ctx) => {
    ctx.responseBody = 'Hello World';
    ctx.responseHeaders['Content-Type'] = 'text/plain';
  });
  app.hook('onResponse', (ctx) => {
    if (ctx.res) ctx.res.end(ctx.responseBody);
  });
  app.listen('http', port);
  return {
    close: () => app.server?.close()
  };
}

async function setupFastify(port) {
  const fastify = require('fastify')();
  fastify.get('/', async () => 'Hello World');
  await fastify.listen({ port });
  return fastify;
}

async function setupExpress(port) {
  const express = require('express');
  const app = express();
  app.get('/', (req, res) => res.send('Hello World'));
  const server = app.listen(port);
  return {
    close: () => server.close()
  };
}

// Note: uWebSockets.js requires native build, not installed here
// async function setupUWS(port) { ... }

async function runBenchmarks() {
  await benchmarkFramework('Scutivion', setupHPF, 3000);
  await benchmarkFramework('Fastify', setupFastify, 3001);
  await benchmarkFramework('Express', setupExpress, 3002);
}

runBenchmarks().catch(console.error);