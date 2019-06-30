'use strict';

function decorateUserResHeaders(container) {
  const resolverFn = container.options.userResHeaderDecorator;
  // const headers = container.user.res._headers;
  const headers = container.user.res.getHeaders ? container.user.res.getHeaders() : container.user.res._headers;

  if (!resolverFn) {
    return Promise.resolve(container);
  }

  return Promise.resolve(
    resolverFn(headers, container.user.req, container.user.res, container.proxy.req, container.proxy.res)
  ).then(function(headers) {
    return new Promise(function(resolve) {
      container.user.res.set(headers);
      resolve(container);
    });
  });
}

module.exports = decorateUserResHeaders;