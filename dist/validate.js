'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var validate = function validate(value, validation) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var name = options.name || '';
  var ON = options.on || validate.on;
  var OFF = options.off || validate.off;
  var WARN = options.warn || validate.warn;
  var BOOL = options.bool || validate.bool;

  var shouldBypassValidation = function shouldBypassValidation() {
    return (process.env.NODE_ENV === 'production' || OFF) && (!ON || !BOOL);
  };

  var runOrValidation = function runOrValidation(name) {
    var failedCount = 0;
    var validationOptions = [];
    validation.forEach(function (option) {
      validationOptions.push(option.type);
      try {
        validate(value, option, { name: name });
      } catch (err) {
        failedCount++;
      }
    });
    if (failedCount === validationOptions.length) throw new Error(name + ': ' + value + ' did not match any of the types: ' + validationOptions.toString());
  };

  var isAcceptedNull = function isAcceptedNull(value) {
    var returnVal = false;
    if (validation.acceptedNulls) {
      validation.acceptedNulls.forEach(function (nullVal) {
        if (nullVal === value) returnVal = true;
      });
    }
    return returnVal;
  };

  try {
    if (shouldBypassValidation()) return value;
    if (Array.isArray(validation)) {
      runOrValidation(name);
    } else {
      // Check for missing value and run required checks
      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (BOOL) return true;else return;
        } else {
          if (BOOL) return false;else throw new Error('Value \'' + name + ': ' + value + '\' is required!');
        }
      }

      // Enable shorthand type
      if (typeof validation === 'string') validation = { type: validation };
      if (!validation.type) throw new Error(name + ': ' + value + '.type is required');
      if (validation.extend) validation.extend(value, validation, name, options);

      if (validate.extensions) validations = [].concat(_toConsumableArray(validations), _toConsumableArray(validate.extensions));

      for (var i = 0; i < validations.length; i++) {
        var currentValidation = validations[i];
        if (validation.type.toLowerCase() === currentValidation.type) {
          currentValidation.rules(value, validation, name);
          break;
        }
      }

      if (BOOL) return true;else return value;
    }
  } catch (err) {
    if (WARN) {
      console.warn(err);
      return value;
    } else if (BOOL) {
      return false;
    } else {
      throw err;
    }
  }
};

// exports must be listed above validations require to avoid circular reference bug
module.exports = validate;
var validations = require('./validations');