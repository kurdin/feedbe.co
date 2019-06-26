'use strict';

var chunkLength = require('../../lib/chunkLength');
var request = require('request');
const { URL } = require('url');

function sendProxyRequest(Container) {
  var req = Container.user.req;
  var res = Container.user.res;
  var bodyContent = Container.proxy.bodyContent;
  var reqOpt = Container.proxy.reqBuilder;
  // reqOpt.host = 'https://' + reqOpt.host;
  reqOpt.rejectUnauthorized = false;

  var options = Container.options;

  return new Promise(function(resolve, reject) {
    var protocol = Container.proxy.requestModule;
    var protocolHTTPS = Container.proxy.requestModuleHTTPS;
    if (typeof protocol === 'undefined') reject('no protocol');

    let proxyReq = protocol.request(reqOpt, reqCallBack);

    function reqCallBack(rsp) {
      // console.log('reqOpt', reqOpt.path);
      var chunks = [];
      rsp.on('data', function(chunk) {
        chunks.push(chunk);
      });
      rsp.on('end', function() {
        if (rsp.statusCode === 404 && req.session.reqPath) {
          proxyReq.abort();
          reqOpt.url = new URL((reqOpt.port === 80 ? 'http://' : 'https://') + reqOpt.host + req.session.reqPath + reqOpt.path);
          req.pipe(request(reqOpt)).pipe(res);
          return;
        }
        if (rsp.statusCode >= 400 && rsp.statusCode < 500) {
           if (req.host !== 'preview2.eoverlay.com') {
             res.redirect(301, 'https://preview2.eoverlay.com/' + req.originalUrl);
          } else {
            res.status(404).send('<h2>Something went wrong, we could not load ' + rsp.req._headers.host + ' website for live test. Try to turn off live test</h2>');
           }
           return;
        }
        if (rsp.statusCode >= 200 && rsp.statusCode < 400) {
          Container.proxy.res = rsp;
          Container.proxy.resData = Buffer.concat(chunks, chunkLength(chunks));
          resolve(Container);
        } else reject();
      });
      rsp.on('error', (err) => {
        console.error('err', err);
        reject(err);
      });
    };

    proxyReq.on('socket', function(socket) {
      if (options.timeout) {
        socket.setTimeout(options.timeout, function() {
          proxyReq.abort();
        });
      }
    });

    // TODO: do reject here and handle this later on
    proxyReq.on('error', function(err) {
      // reject(error);
      if (err.code === 'ENOTFOUND') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end(`Host ${err.hostname} Not Found`);
      }
      if (err.code === 'ECONNRESET') {
        res.setHeader('X-Timout-Reason', 'Timed out your request after ' + options.timeout + 'ms.');
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end();
      } else {
        if (reqOpt.host.indexOf('https://') !== 0) {
          proxyReq.abort();
          reqOpt.port = '443';
          if (reqOpt.host.indexOf('http://') === 0) reqOpt.host = reqOpt.host.replace('http://', 'https://');
          else reqOpt.host = 'https://' + reqOpt.host;
          protocolHTTPS.request(reqOpt, reqCallBack);
          // reqOpt.host = reqOpt.host;
          return;
        }
        // res.writeHead(500, { 'Content-Type': 'text/plain' });
        // res.end();
        // proxyReq.abort();
        // console.error('error ends');
        // res.writeHead(504, { 'Content-Type': 'text/plain' });
        // res.end();
        reject(err);
      }
    });

    // this guy should go elsewhere, down the chain
    if (options.parseReqBody) {
      // We are parsing the body ourselves so we need to write the body content
      // and then manually end the request.

      //if (bodyContent instanceof Object) {
      //throw new Error
      //debugger;
      //bodyContent = JSON.stringify(bodyContent);
      //}

      if (bodyContent.length) {
        proxyReq.write(bodyContent);
      }
      proxyReq.end();
    } else {
      // Pipe will call end when it has completely read from the request.
      req.pipe(proxyReq);
    }

    req.on('aborted', function() {
      // reject?
      proxyReq.abort();
    });

  });
}

module.exports = sendProxyRequest;
