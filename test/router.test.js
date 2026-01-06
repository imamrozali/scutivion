const { expect } = require('chai');
const TrieRouter = require('../Router/TrieRouter');

describe('TrieRouter', () => {
  it('should insert and lookup route', () => {
    const router = new TrieRouter();
    const handler = () => {};
    router.insert('GET', '/users', handler);
    const params = [];
    const found = router.lookup('GET', '/users', params);
    expect(found).to.equal(handler);
  });

  it('should extract params', () => {
    const router = new TrieRouter();
    router.insert('GET', '/users/:id', () => {});
    const params = [];
    router.lookup('GET', '/users/123', params);
    expect(params[0]).to.equal('123');
  });
});