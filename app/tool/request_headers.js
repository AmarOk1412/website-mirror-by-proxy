module.exports = function(config) {

  return function(req, res, next) {

    req.headers['host'] = config.parsed_target.host;
    req.headers['origin'] = config.target;

    next();
  };
}
