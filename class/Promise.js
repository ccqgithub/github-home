import {ServiceError} from './Errors';
import Promise from 'es6-promise';

var CustomPromise = Promise.Promise;

// 自动将异常抛出到最外层
CustomPromise.prototype.error = function (onRejected) {
  return this.catch(function(reason) {

    if (console.warn) {
      try {
        console.warn(reason);
        console.warn(reason.stack);
      } catch(e) {
        //
      }
    }

    if (reason instanceof ServiceError) {
      onRejected(reason);
    } else if (reason instanceof Error) {
      onRejected(new ServiceError(reason.message, -1, {stack: reason.stack}));
    } else {
      onRejected(new ServiceError(String(reason), -1, {stack: (new Error).stack}));
    }

    throw reason;
  });
};

// 增加finally
CustomPromise.prototype.finally = function (callback) {
  var P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  ).catch(function (reason) {
    setTimeout(() => { throw reason }, 0);
    throw reason
  });
};

// 加在最后，捕获异常
CustomPromise.prototype.done = function (onFulfilled, onRejected) {
  return this.then(onFulfilled, onRejected)
    .catch(function (reason) {
      setTimeout(() => { throw reason }, 0);
      throw reason
    });
};

module.exports = CustomPromise;
