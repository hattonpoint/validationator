"use strict";

module.exports = function (test, arr) {
  var returnVal = false;
  arr.forEach(function (item) {
    if (item === test) returnVal = true;
  });
  return returnVal;
};