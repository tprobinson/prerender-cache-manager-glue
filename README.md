# prerender-s3-cache

More thorough instructions WIP

Example of using this plugin:

```js
const S3Cache = require('prerender-s3-cache')
const prerender = require('prerender');
const server = prerender();

server.use(new S3Cache({
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET,
}))

server.start();
```

Inspired by https://github.com/homerjam/prerender-s3-cache-alt
