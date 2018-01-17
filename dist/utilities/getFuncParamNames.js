'use strict';

module.exports = function (func) {
  var STRIP_COMMENTS_DEFAULTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  var fnStr = func.toString().replace(STRIP_COMMENTS_DEFAULTS, '');
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result[0] === '{' && result[result.length - 1 === '}']) result = result.slice(1, -1);
  if (result === null) result = [];
  return result;
};