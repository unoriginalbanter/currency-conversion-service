'use strict';

const assert = require('assert');
const logr   = require('em-logr').create({name: 'routes'});

// route structure created by loading the routes from the routes folder
const routes = {
  root:    require('./root'),
  convert: require('./convert'),
  example: require('./example'),
  info:    require('./info'),
  healthcheck: require('./healthcheck'),
};

const { getMajorVersionNumber } = require('@everymundo/generate-microservice-name');

const getPrefixFromPackageJSON = () => `/v${getMajorVersionNumber()}`;

const registerRoutes = async (fastify) => {
  // security: https://github.com/fastify/fastify-helmet
  fastify.register(require('fastify-helmet'));

  const prefix = getPrefixFromPackageJSON();

  Object.keys(routes)
    .forEach((routeKey) => {
      const routeLib = routes[routeKey];

      Object.keys(routeLib)
        .forEach((keyMethod) => {
          const { url, method, beforeHandler, handler} = routeLib[keyMethod];
          const regx = /^\//;

          assert(regx.test(url), `${routeKey} => INVALID PATH/URL [${url}] for route [${routeKey}] does not match ${regx}`);

          logr.debug(`registering ${url}`);
          fastify.route({url: `${prefix}${url}`, method, beforeHandler, handler});
        });
    });

  return fastify;
};

// exporting in this way makes testing/stubbing easier
module.exports = {
  routes,
  registerRoutes,
  getPrefixFromPackageJSON,
};
