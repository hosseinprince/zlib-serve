# zlib-serve

## Project setup
```
npm install zlib-serve
```

```
let   serverZip    = require('zlib-serve');
let   serve        = serverZip('dist', { 'index': 'index.html'});
```
http.createServer(options, (req, res) => {
 

  serve(req, res, function () {
   ....
    router(req, res, finalhandler(req, res));
  })


}).listen(80);


