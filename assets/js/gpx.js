Error: Cannot find module 'fs/promises'
Require stack:
- /usr/local/lib/node_modules/minify/lib/minify.js
- /usr/local/lib/node_modules/minify/bin/minify.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:815:15)
    at Function.Module._load (internal/modules/cjs/loader.js:667:27)
    at Module.require (internal/modules/cjs/loader.js:887:19)
    at require (internal/modules/cjs/helpers.js:74:18)
    at Object.<anonymous> (/usr/local/lib/node_modules/minify/lib/minify.js:5:20)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
    at Module.load (internal/modules/cjs/loader.js:863:32)
    at Function.Module._load (internal/modules/cjs/loader.js:708:14)
    at Module.require (internal/modules/cjs/loader.js:887:19) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/usr/local/lib/node_modules/minify/lib/minify.js',
    '/usr/local/lib/node_modules/minify/bin/minify.js'
  ]
}
