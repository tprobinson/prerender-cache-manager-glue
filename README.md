# prerender-cache-manager-glue

[![https://nodei.co/npm/prerender-cache-manager-glue.svg?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/prerender-cache-manager-glue.svg?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/prerender-cache-manager-glue)

[![npm version](https://badge.fury.io/js/prerender-cache-manager-glue.svg)](https://badge.fury.io/js/prerender-cache-manager-glue)
[![Dependency Status](https://david-dm.org/tprobinson/node-prerender-cache-manager-glue.svg)](https://david-dm.org)

This package is just a wrapper for [cache-manager](https://www.npmjs.com/package/cache-manager).

Pass an initialized cache-manager to this wrapper to cache Prerender's results and serve them up from cache.

Example of using this plugin:

```js
const prerender = require('prerender');
const cacheManager = require('cache-manager')
const S3Cache = require('cache-manager-s3')
const PrerenderCacheManagerGlue = require('prerender-cache-manager-glue')
const server = prerender();

server.use(new PrerenderCacheManagerGlue(
  cacheManager.caching({
    store: new S3Cache({
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      bucket: process.env.S3_BUCKET,
    }),
    ttl: 3600,
  })
))

server.start();
```

For more examples. check out the [cache-manager](https://www.npmjs.com/package/cache-manager) documentation.

The [S3 cache-manager plugin](https://github.com/tprobinson/node-cache-manager-s3) is recommended due to the typically large size of HTML assets.

# License

[MIT](https://www.tldrlegal.com/l/mit)
