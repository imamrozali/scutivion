class RadixNode {
  constructor() {
    this.children = {};
    this.handlers = {};
    this.paramName = null;
    this.isWildcard = false;
  }
}

class Router {
  constructor() {
    this.root = new RadixNode();
  }

  /** @param {string} method @param {string} path @param {Function} handler */
  insert(method, path, handler) {
    let node = this.root;
    const segments = path.split('/').filter(s => s.length > 0);

    for (const segment of segments) {
      let child = node.children[segment];
      if (!child) {
        child = new RadixNode();
        if (segment.startsWith(':')) {
          child.paramName = segment.slice(1);
        } else if (segment === '*') {
          child.isWildcard = true;
        }
        node.children[segment] = child;
      }
      node = child;
    }

    node.handlers[method] = handler;
  }

  /** @param {string} method @param {string} path @param {string[]} params @returns {Function|null} */
  lookup(method, path, params) {
    let node = this.root;
    const segments = path.split('/').filter(s => s.length > 0);
    let paramIndex = 0;

    for (const segment of segments) {
      let child = node.children[segment];
      if (!child) {
        for (const key in node.children) {
          const c = node.children[key];
          if (c.paramName) {
            params[paramIndex++] = segment;
            child = c;
            break;
          } else if (c.isWildcard) {
            child = c;
            break;
          }
        }
      }
      if (!child) return null;
      node = child;
    }

    return node.handlers[method] || null;
  }
}

module.exports = Router;