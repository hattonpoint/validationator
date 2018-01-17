'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getFuncParamNames = require('./utilities/getFuncParamNames');
var matchesAny = require('./utilities/matchesAny');
var validate = require('./validate');

// options: off, warn, on
module.exports = function (func, params) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  try {
    var name = options.name || func.name;
    params = Array.isArray(params) ? params : [params];
    if ((process.env.NODE_ENV === 'production' || options.off) && !options.on) return func.apply(undefined, _toConsumableArray(params));

    var inputModel = func.inputModel;
    var outputModel = func.outputModel;

    if (!func) throw new Error('Missing required argument func');
    if (typeof func !== 'function') throw new Error('First argument is not a function!');
    if (!inputModel && !outputModel) throw new Error('ERROR: No validation props set for ' + name + '. Please specify ' + name + '.inputModel or ' + name + '.outputModel');

    if (inputModel && !outputModel) {
      validateInput(params, inputModel, func, name);
    }

    if (outputModel && !inputModel) {
      validate(func.apply(undefined, _toConsumableArray(params)), outputModel, { name: name });
    }

    if (inputModel && outputModel) {
      validateInput(params, inputModel, func, name);
      validate(func.apply(undefined, _toConsumableArray(params)), outputModel, { name: name });
    }
  } catch (err) {
    if (options.warn) {
      console.warn(err);
      return func.apply(undefined, _toConsumableArray(params));
    } else {
      throw err;
    }
  }

  return func.apply(undefined, _toConsumableArray(params));
};

var validateInput = function validateInput(params, inputModel, func, name) {
  var paramNames = getFuncParamNames(func);

  if (typeof inputModel.type === 'string') {
    // single parameter
    if (params.length > 1) throw new Error('ERROR: ' + name + ' expected 1 parameter but received ' + params.length);
    validate(params[0], inputModel, { name: paramNames[0] });
    return;
  }

  if (Array.isArray(inputModel)) {
    // multiple parameters
    if (inputModel.length !== paramNames.length) throw new Error('ERROR: parameters and input model for ' + name + ' are out of sync. There are ' + inputModel.length + ' entries to the inputModel and ' + paramNames.length + ' paramerters.');
    if (!Array.isArray(params)) throw new Error('ERROR: Multiple params must me passed into validateFunc as an array.');
    inputModel.forEach(function (model, i) {
      validate(params[i], model, { name: paramNames[i] });
    });
    return;
  }

  if ((typeof inputModel === 'undefined' ? 'undefined' : _typeof(inputModel)) === 'object') {
    // object deconstruction params
    params = params[0];
    if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== 'object' || Array.isArray(params)) throw new Error('Error: Expected a single object as the sole function param (ES6 parameter destructuring).');
    var modelKeys = Object.keys(inputModel);
    var paramKeys = Object.keys(params);

    if (modelKeys.length !== paramKeys.length) throw new Error('ERROR: parameters and input model for ' + name + ' are out of sync. There are ' + modelKeys.length + ' entries to the inputModel and ' + paramKeys.length + ' paramerters.');

    paramKeys.forEach(function (paramKey) {
      if (!matchesAny(paramKey, paramNames)) throw new Error('ERROR: The paramKey \'' + paramKey + '\' does not match any of the available parameters: ' + paramNames.toString());
      if (!matchesAny(paramKey, modelKeys)) throw new Error('ERROR: The paramKey \'' + paramKey + '\' has not been included ' + name + '.inputModel');
    });

    modelKeys.forEach(function (modelKey) {
      validate(params[modelKey], inputModel[modelKey], { name: modelKey });
    });
    return;
  }
  throw new Error('UNKNOWN ERROR: the function input model did not match the api spec.');
};