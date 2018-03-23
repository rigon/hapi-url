
const Test = require('blue-tape')
const Hapi = require('hapi');
const HapiUrl = require('./');


function Server(options) {
    var server = new Hapi.Server()
    server.route({
        method: 'GET',
        path: '/{url*}',
        handler: function (request, h) {
            return h.response({
                current: HapiUrl.current(request),
                resolve: HapiUrl.resolve(request, "/some/path")
            });
        }
    })
    return server
}


Test('direct requests', function(t) {
    HapiUrl.init({
        protocol: "",
        host: "",
        basePath: "",
    });
    
    return Server().inject({
        url: '/',
        headers: {
            host: 'example.com',
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "http://example.com/", 'current url');
        t.equal(data.resolve, "http://example.com/some/path", 'resolve url');
    });
});

Test('custom options', function(t) {
    HapiUrl.init({
        protocol: "https",
        host: "anotherhost.com:8080",
        basePath: "/a-prefix"
    });

    return Server().inject({
        url: '/',
        headers: {
            host: 'example.com',
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "https://anotherhost.com:8080/a-prefix/", 'current url');
        t.equal(data.resolve, "https://anotherhost.com:8080/a-prefix/some/path", 'resolve url');
    });
});

Test('direct requests with some url', function(t) {
    HapiUrl.init({
        protocol: "",
        host: "",
        basePath: "",
    });
    
    return Server().inject({
        url: '/url',
        headers: {
            host: 'example.com',
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "http://example.com/url", 'current url');
        t.equal(data.resolve, "http://example.com/some/path", 'resolve url');
    });
});

Test('custom options with some url', function(t) {
    HapiUrl.init({
        protocol: "https",
        host: "anotherhost.com",
        basePath: "/a-prefix"
    });

    return Server().inject({
        url: '/url',
        headers: {
            host: 'example.com',
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "https://anotherhost.com/a-prefix/url", 'current url');
        t.equal(data.resolve, "https://anotherhost.com/a-prefix/some/path", 'resolve url');
    });
});

Test('proxied requests', function(t) {

    HapiUrl.init({
        protocol: "",
        host: "",
        basePath: ""
    });

    return Server().inject({
        url: '/url',
        headers: {
            host: 'example.com',
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'proxy.example.com:8080'
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "https://proxy.example.com:8080/url", 'current url');
        t.equal(data.resolve, "https://proxy.example.com:8080/some/path", 'resolve url');
    });
});

Test('custom options and proxied requests', function(t) {

    HapiUrl.init({
        protocol: "https",
        host: "hiddenproxy.example.com",
        basePath: "/a-prefix/"
    });

    return Server().inject({
        url: '/url/',
        headers: {
            host: 'example.com/',
            'x-forwarded-proto': 'http',
            'x-forwarded-host': 'proxy.example.com'
        }
    })
    .then(function (response) {
        var data = JSON.parse(response.payload);
        t.equal(data.current, "https://hiddenproxy.example.com/a-prefix/url/", 'current url');
        t.equal(data.resolve, "https://hiddenproxy.example.com/a-prefix/some/path", 'resolve url');
    });
});
