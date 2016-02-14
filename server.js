var httpProxy = require('http-proxy'),
  connect = require('connect'),
  http = require('http'),
  url = require('url'),
  config = require('./' + (process.argv[2] || './config'));

// Parse target url
config.parsed_target = url.parse(config.target);

// Basic Connect App
var app = connect();

// Initialize reverse proxy
var proxy = httpProxy.createProxyServer({
  secure: false
});

// Handle proxy response
var handle_proxy_redirection = require('./app/tool/redirections')(config);
proxy.on('proxyRes', handle_proxy_redirection);

// Change request headers
app.use(require('./app/tool/request_headers')(config));

var transforms = {
  'text/html': require('./app/parsers').html,
  'application/javascript': require('./app/parsers').javascript
};

app.use(require('./app/tool/transform')(transforms));

app.use(function(req, res) {
  proxy.web(req, res, {
    target: config.target
  });
});

// Handle errors
proxy.on('error', function(err, req, res) {

  // @todo: logs

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('We are sorry, but we cannot serve this request.');
});

if(config.https){

  lex = require('letsencrypt-express').testing();

  // Use letsencrypt certificate to serve requests over https
  lex.create('./le', app).listen([], [config.port], function () {

    console.log('HTTPS server started at port ' + config.port);
  });
} else {

  // Use plain http
  http.createServer(app).listen(config.port);

  console.log('HTTP server started at port ' + config.port);
}

