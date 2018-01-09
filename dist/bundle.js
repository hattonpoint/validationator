/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var matchesAny = __webpack_require__(2); // options: off, warn, bool, on


var validate = function validate(value, validation) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  try {
    if ((process.env.NODE_ENV === 'production' || options.off) && (!options.on || !options.bool)) return;
    var name = options.name || '';

    if (Array.isArray(validation)) {
      var failedCount = 0;
      var validationOptions = [];
      validation.forEach(function (option) {
        validationOptions.push(option.type);

        try {
          validate(value, option, {
            name: name
          });
        } catch (err) {
          failedCount++;
        }
      });
      if (failedCount === validationOptions.length) throw new Error("".concat(name, " did not match any of the types: ").concat(validationOptions.toString()));
    } else {
      var isAcceptedNull = function isAcceptedNull(value) {
        var returnVal = false;

        if (validation.acceptedNulls) {
          validation.acceptedNulls.forEach(function (nullVal) {
            if (nullVal === value) returnVal = true;
          });
        }

        return returnVal;
      };

      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (options.bool) return true;else return;
        } else {
          if (options.bool) return false;else throw new Error("Argument '".concat(name, "' is required!"));
        }
      }

      if (typeof validation === 'string') validation = {
        type: validation
      };
      if (!validation.type) throw new Error("".concat(name, ".type is required"));
      if (validation.extend) validation.extend(value, validation, name, options);

      switch (validation.type.toLowerCase()) {
        case 'function':
          {
            if (typeof value !== 'function') throw new Error("Expected ".concat(name, " to be type function. Got ").concat(_typeof(value)));
          }
          break;

        case 'object':
          {
            var _validation = validation,
                requiredKeys = _validation.requiredKeys,
                children = _validation.children,
                minLength = _validation.minLength,
                maxLength = _validation.maxLength,
                allChildren = _validation.allChildren;
            var valueKeys = Object.keys(value);
            if (_typeof(value) !== 'object' || Array.isArray(value)) throw new Error("Expected ".concat(name, " to be type object. Got ").concat(_typeof(value), " Array.isArray? ").concat(Array.isArray(value)));

            if (requiredKeys) {
              requiredKeys.forEach(function (requiredKey) {
                if (!valueKeys.find(function (valueKey) {
                  return valueKey === requiredKey;
                })) throw new Error("Missing required key: ".concat(requiredKey));
              });
            }

            if (typeof minLength === 'undefined' ? false : valueKeys.length < minLength) throw new Error("Object length is less than minimum");
            if (typeof maxLength === 'undefined' ? false : valueKeys.length > maxLength) throw new Error("Object length is more than maximum");
            if (allChildren) valueKeys.forEach(function (valueKey) {
              return validate(value[valueKey], allChildren, {
                name: valueKey
              });
            });

            if (children) {
              if (_typeof(children) !== 'object' || Array.isArray(children)) throw new Error("Expected ".concat(name, " validation children to be type object. Got ").concat(_typeof(value), " Array.isArray? ").concat(Array.isArray(value)));
              var modelKeys = Object.keys(children);
              if (modelKeys.length !== valueKeys.length) throw new Error("keys and validation model for ".concat(name, " are out of sync. Did you mean to use allChildren? There are ").concat(modelKeys.length, " entries to the inputModel and ").concat(valueKeys.length, " paramerters."));
              valueKeys.forEach(function (valueKey) {
                if (!matchesAny(valueKey, modelKeys)) throw new Error("The valueKey '".concat(valueKey, "' has not been included ").concat(name, " children"));
              });
              modelKeys.forEach(function (modelKey) {
                validate(value[modelKey], children[modelKey], modelKey);
              });
            }
          }
          break;

        case 'array':
          {
            var _validation2 = validation,
                _maxLength = _validation2.maxLength,
                _minLength = _validation2.minLength,
                _allChildren = _validation2.allChildren,
                _children = _validation2.children;
            if (!Array.isArray(value)) throw new Error("Expected ".concat(name, " to be type array. Got ").concat(_typeof(value)));
            if (typeof _minLength === 'undefined' ? false : value.length < _minLength) throw new Error("Array length is less than minimum");
            if (typeof _maxLength === 'undefined' ? false : value.length > _maxLength) throw new Error("Array length is more than maximum");
            if (_allChildren) value.forEach(function (item, i) {
              return validate(value[i], _allChildren, {
                name: i
              });
            });

            if (_children) {
              if (_children.length !== value.length) throw new Error("validation and array for ".concat(name, " are out of sync."));
              if (!Array.isArray(_children)) throw new Error("".concat(name, ".children must be an array."));

              _children.forEach(function (model, i) {
                validate(value[i], model, {
                  name: i
                });
              });
            }
          }
          break;

        case 'string':
          {
            var _validation3 = validation,
                _maxLength2 = _validation3.maxLength,
                _minLength2 = _validation3.minLength,
                regEx = _validation3.regEx; // TODO: Add options for checking different case styles
            // TODO: Options to recreate password validation. Use at least once etc
            // TODO: Add shorthand for type only check validate('asdf', 'string')
            // TODO: Migrate name to the options object

            if (typeof value !== 'string') throw new Error("Expected ".concat(name, " to be type string. Got ").concat(_typeof(value)));
            if (typeof _minLength2 === 'undefined' ? false : value.length < _minLength2) throw new Error("String length is less than minimum");
            if (typeof _maxLength2 === 'undefined' ? false : value.length > _maxLength2) throw new Error("String length is more than maximum");
            if (typeof regEx === 'undefined' ? false : !regEx.test(value)) throw new Error("String does not match the validation regEx.");
          }
          break;

        case 'number':
          {
            var _validation4 = validation,
                max = _validation4.max,
                min = _validation4.min,
                decimals = _validation4.decimals,
                _regEx = _validation4.regEx;
            if (typeof value !== 'number') throw new Error("Expected ".concat(name, " to be type number. Got ").concat(_typeof(value)));
            if (typeof min === 'undefined' ? false : value < min) throw new Error("Number is less than minimum");
            if (typeof max === 'undefined' ? false : value > max) throw new Error("Number is more than maximum");
            if (typeof decimals === 'undefined' ? false : function () {
              var stringArr = value.toString().split('.');

              if (stringArr[1]) {
                return stringArr[1].length > decimals;
              }
            }()) throw new Error("Number: ".concat(value, " has more than ").concat(decimals, " decimails."));
            if (typeof _regEx === 'undefined' ? false : !_regEx.test(value)) throw new Error("String does not match the validation regEx.");
          }
          break;

        case 'boolean':
          {
            if (typeof value !== 'boolean') throw new Error("Expected ".concat(name, " to be type boolean. Got ").concat(_typeof(value)));
          }
          break;

        case 'email':
          {
            validate(value, {
              type: 'string',
              maxLength: 50,
              regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }, {
              name: name
            });
          }
          break;

        default:
          {
            throw new Error("unkown validation type: ".concat(validation.type));
          }
      }

      if (options.bool) return true;
    }
  } catch (err) {
    if (options.warn) {
      console.warn(err);
    } else if (options.bool) {
      return false;
    } else {
      throw err;
    }
  }
};

module.exports = validate;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function (test, arr) {
  var returnVal = false;
  arr.forEach(function (item) {
    if (item === test) returnVal = true;
  });
  return returnVal;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

(function () {
  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this; // Create a reference to this

  var _ = {
    validate: __webpack_require__(0),
    validateFunc: __webpack_require__(4)
  };
  var isNode = false; // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    root._ = _;
    isNode = true;
  } else {
    root._ = _;
  }
})();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getFuncParamNames = __webpack_require__(5);

var matchesAny = __webpack_require__(2);

var validate = __webpack_require__(0); // options: off, warn, on


module.exports = function (func, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  try {
    var name = options.name || func.name;
    params = Array.isArray(params) ? params : [params];
    if ((process.env.NODE_ENV === 'production' || options.off) && !options.on) return func.apply(void 0, _toConsumableArray(params));
    var inputModel = func.inputModel;
    var outputModel = func.outputModel;
    if (!func) throw new Error('Missing required argument func');
    if (typeof func !== 'function') throw new Error('First argument is not a function!');
    if (!inputModel && !outputModel) throw new Error("ERROR: No validation props set for ".concat(name, ". Please specify ").concat(name, ".inputModel or ").concat(name, ".outputModel"));

    if (inputModel && !outputModel) {
      validateInput(params, inputModel, func, name);
    }

    if (outputModel && !inputModel) {
      validate(func.apply(void 0, _toConsumableArray(params)), outputModel, {
        name: name
      });
    }

    if (inputModel && outputModel) {
      validateInput(params, inputModel, func, name);
      validate(func.apply(void 0, _toConsumableArray(params)), outputModel, {
        name: name
      });
    }
  } catch (err) {
    if (options.warn) {
      console.warn(err);
      return func.apply(void 0, _toConsumableArray(params));
    } else {
      throw err;
    }
  }

  return func.apply(void 0, _toConsumableArray(params));
};

var validateInput = function validateInput(params, inputModel, func, name) {
  var paramNames = getFuncParamNames(func);

  if (typeof inputModel.type === 'string') {
    // single parameter
    if (params.length > 1) throw new Error("ERROR: ".concat(name, " expected 1 parameter but received ").concat(params.length));
    validate(params[0], inputModel, {
      name: paramNames[0]
    });
    return;
  }

  if (Array.isArray(inputModel)) {
    // multiple parameters
    if (inputModel.length !== paramNames.length) throw new Error("ERROR: parameters and input model for ".concat(name, " are out of sync. There are ").concat(inputModel.length, " entries to the inputModel and ").concat(paramNames.length, " paramerters."));
    if (!Array.isArray(params)) throw new Error("ERROR: Multiple params must me passed into validateFunc as an array.");
    inputModel.forEach(function (model, i) {
      validate(params[i], model, {
        name: paramNames[i]
      });
    });
    return;
  }

  if (_typeof(inputModel) === 'object') {
    // object deconstruction params
    params = params[0];
    if (_typeof(params) !== 'object' || Array.isArray(params)) throw new Error("Error: Expected a single object as the sole function param (ES6 parameter destructuring).");
    var modelKeys = Object.keys(inputModel);
    var paramKeys = Object.keys(params);
    if (modelKeys.length !== paramKeys.length) throw new Error("ERROR: parameters and input model for ".concat(name, " are out of sync. There are ").concat(modelKeys.length, " entries to the inputModel and ").concat(paramKeys.length, " paramerters."));
    paramKeys.forEach(function (paramKey) {
      if (!matchesAny(paramKey, paramNames)) throw new Error("ERROR: The paramKey '".concat(paramKey, "' does not match any of the available parameters: ").concat(paramNames.toString()));
      if (!matchesAny(paramKey, modelKeys)) throw new Error("ERROR: The paramKey '".concat(paramKey, "' has not been included ").concat(name, ".inputModel"));
    });
    modelKeys.forEach(function (modelKey) {
      validate(params[modelKey], inputModel[modelKey], {
        name: modelKey
      });
    });
    return;
  }

  throw new Error("UNKNOWN ERROR: the function input model did not match the api spec.");
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function (func) {
  var STRIP_COMMENTS_DEFAULTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  var fnStr = func.toString().replace(STRIP_COMMENTS_DEFAULTS, '');
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result[0] === '{' && result[result.length - 1 === '}']) result = result.slice(1, -1);
  if (result === null) result = [];
  return result;
};

/***/ })
/******/ ]);