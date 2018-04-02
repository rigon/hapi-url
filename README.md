# Hapi.js URL resolver

URL resolver for [Hapi.js](https://hapijs.com/)

## How to use

Returns an [URL object](https://www.npmjs.com/package/url) representing the current server's URL:

```javascript
const HapiUrl = require('hapi-url');
console.log(HapiUrl(request));
console.log(HapiUrl(request).format());
console.log(HapiUrl(request).resolve("/path"));
```

Or, you can also write as:

```javascript
const HapiUrl = require('hapi-url');
console.log(HapiUrl.current(request));
console.log(HapiUrl.resolve(request, "/path"));
```

`hapi-url` looks for `x-forwarded-proto` and `x-forwarded-host` to resolve the current URL correctly when behind a reverse proxy. 

If `hapi-url` is not clever enought for your case, you can override the `protocol`, `host` and `basePath`. `basePath` can be used to resolve the URL when the proxy adds a prefix in the path:

```javascript
const HapiUrl = require('hapi-url');
Hapi.init({
    protocol: "https",
    host: "hiddenproxy.example.com",
    basePath: "/proxy/path/"
})
console.log(HapiUrl.format(request));
```

## Example

```javascript
const Hapi = require('hapi');
const HapiUrl = require('hapi-url');

const server = new Hapi.Server({port: 3000});

server.route({
    method: 'GET',
    path: '/{path*}', // match some path
    handler: function(request, h) {
        return h.response(HapiUrl.current(request));    // reply with current URL
    }
});

server.start();
```
