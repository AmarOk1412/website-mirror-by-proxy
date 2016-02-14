module.exports = function(config) {

  return function(proxyRes, req, res) {

    if (proxyRes.statusCode >= 301 && proxyRes.statusCode <= 302) {

      var replaced = proxyRes.headers['location'].replace(config.parsed_target.host, config.source);
      proxyRes.headers['location'] = replaced;
    }
  };
}
