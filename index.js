var fs     = require('fs');
var pathjs = require('path');
var zlib   = require('zlib');

var directory = "/";
var opt       = {};
function serverZip(root, option) {
    directory = root;
    opt       = option;
    return serve;
}

function serve(req, res, next) {
    var url  = normalizeUrl(req.url);
    var path = pathjs.join(directory, url);
    
    if (url === "/") {
        path = pathjs.join(directory, (opt.index ? opt.index : "index.html"));
    }
    fs.lstat(path, function (error, stats) {
        if (error) {
            next();
        }
        else if (stats.isFile() && path.indexOf('.svg')===-1) {
            serveCompressed(path, opt.type, res);
        }
        else if (stats.isFile() && path.indexOf('.svg')>-1){
            fs.readFile(path, function(err, content) {
                response.writeHead(200, { 'Content-Type': 'image/svg+xml' });
                response.end(content, 'utf-8');
            })
        }
    })
}


function serveCompressed(path, type = "deflate", response) {
    var ext = {
        gzip   : '.gz',
        deflate: '.def'
    };
    var zlibMethod = {
        gzip   : zlib.createGzip,
        deflate: zlib.createDeflate
    };
    var zipped = fs.createReadStream(path + ext[type])

    response.writeHead(200, { 'content-encoding': type });

    zipped.on('error', function (error1) {

        var inp = fs.createReadStream(path);
        inp.on('error', function (error2) {
            response.writeHead(500);
            response.end('Internal Server error.', 'utf-8');
        });

        var out = fs.createWriteStream(path + ext[type]);
        out.on('error', function (error3) {

        });

        inp.pipe(zlibMethod[type]()).pipe(out);
        inp.pipe(zlibMethod[type]()).pipe(response);
    });

    zipped.pipe(response);

}

module.exports = serverZip;

function normalizeUrl(url) {
    var unsafeURL = url;

    try {
        unsafeURL = decodeURIComponent(unsafeURL);
        if (unsafeURL.indexOf('%') > -1) {
            return "/";
        }
        else {
            var safeURL = pathjs.normalize(unsafeURL);
                safeURL = safeURL.replace(/\\/g, '/');
            if (safeURL === '.' || safeURL === './') {
                safeURL = '/';
            }
            return safeURL.endsWith("/") && safeURL.length > 1 ? safeURL.slice(0, -1): safeURL;
        }
    }
    catch (e) {
        return "/";
    }
}
