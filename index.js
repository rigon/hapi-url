const Url = require('url');

var internals = {
    protocol: "",
    host: "",
    basePath: "",
}


function concatenateUrl() {
    return Array.from(arguments).reduce(function(sum, currentValue){
        var cur = String(currentValue);
        return sum +
            ((sum.endsWith("/") && cur.startsWith("/")) ? cur.substring(1) :    // avoid double slash
            (!sum.endsWith("/") && !cur.startsWith("/")) ? "/" + cur :          // avoid concatenation without a slash
            cur);                                                               // nothing to do
    });
}

function first(commaList) {
    if(typeof commaList === "string")
        return commaList.split(",")[0];     // First element
    
    return null;
}

function HapiUrl(request) {
    var url = Object.assign(new Url.Url(), request.url, {
        protocol: internals.protocol || first(request.headers['x-forwarded-proto']) || request.server.info.protocol,
        host: internals.host || first(request.headers['x-forwarded-host']) || request.info.host,
        pathname: concatenateUrl(internals.basePath, request.url.pathname)
    });
    
    // Fix to resolve when a basePath is configured, otherwise it will not be added
    var resolveFn = url.resolve;
    url.resolve = function(newUrl) {
        return resolveFn.call(url, concatenateUrl(internals.basePath, newUrl));
    }

    return url;
}


HapiUrl.init = function(options) {
    if(options != null && typeof options === "object") {
        if(typeof options.protocol === "string") internals.protocol = options.protocol;
        if(typeof options.host === "string") internals.host = options.host;
        if(typeof options.basePath === "string") internals.basePath = options.basePath;
    }
}

HapiUrl.current = function(request) {
    return HapiUrl(request).format();
}
HapiUrl.resolve = function(request, url) {
    return HapiUrl(request).resolve(url);
}

module.exports = HapiUrl;
