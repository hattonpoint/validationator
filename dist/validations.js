'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('ians-utils'),
    includesAnyTest = _require.includesAny;

var validations = [{
  type: 'array',
  rules: function rules(value, validation, name) {
    var maxLen = validation.maxLen,
        minLen = validation.minLen,
        allChildren = validation.allChildren,
        children = validation.children,
        includes = validation.includes,
        notIncludes = validation.notIncludes,
        includesAny = validation.includesAny,
        notIncludesAny = validation.notIncludesAny;

    if (!Array.isArray(value)) throw new Error('Expected ' + name + ': ' + value + ' to be type array. Got ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
    if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error('Array ' + name + ': ' + value + ' length is ' + value.length + '. Less than minimum ' + minLen + '.');
    if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error('Array ' + name + ': ' + value + ' is ' + value.length + '. More than maximum ' + maxLen + '.');
    if (typeof includes !== 'undefined' && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error('Array ' + name + ': ' + value + ' does not include required string: ' + includes + '.');
    if (typeof notIncludes !== 'undefined' && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error('Array ' + name + ': ' + value + ' includes blacklisted string: ' + notIncludes + '.');
    if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error('Array ' + name + ': ' + value + ' does not include required string from: ' + includesAny + '.');
    if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error('Array ' + name + ': ' + value + ' includes blacklisted string from: ' + notIncludesAny + '.');
    if (allChildren) value.forEach(function (item, i) {
      return validate(value[i], allChildren, { name: i });
    });
    if (children) {
      if (!Array.isArray(children)) throw new Error(name + ': ' + value + '. Children must be an array. Got type ' + (typeof children === 'undefined' ? 'undefined' : _typeof(children)) + '.');
      console.log('validate :  : ', validate);
      children.forEach(function (model, i) {
        validate(value[i], model, { name: i });
      });
    }
  }
}, {
  type: 'function',
  rules: function rules(value, validation, name) {
    if (typeof value !== 'function') throw new Error('Expected ' + name + ': ' + value + ' to be type function. Got ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
  }
}, {
  type: 'object',
  rules: function rules(value, validation, name) {
    var requiredKeys = validation.requiredKeys,
        children = validation.children,
        minLen = validation.minLen,
        maxLen = validation.maxLen,
        allChildren = validation.allChildren,
        includes = validation.includes,
        notIncludes = validation.notIncludes,
        includesAny = validation.includesAny,
        notIncludesAny = validation.notIncludesAny;

    var valueKeys = Object.keys(value);
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || Array.isArray(value)) throw new Error('Expected ' + name + ': ' + value + ' to be type object. Got type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '. Array.isArray? ' + Array.isArray(value) + '.');
    if (requiredKeys) {
      requiredKeys.forEach(function (requiredKey) {
        if (!valueKeys.find(function (valueKey) {
          return valueKey === requiredKey;
        })) throw new Error(name + ': ' + value + ' missing required key: ' + requiredKey + '.');
      });
    }
    if (typeof includes !== 'undefined' && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error('Object ' + name + ': ' + value + ' does not include required string: ' + includes + '.');
    if (typeof notIncludes !== 'undefined' && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error('Object ' + name + ': ' + value + ' includes blacklisted string: ' + notIncludes + '.');
    if (typeof minLen !== 'undefined' && valueKeys.length < minLen) throw new Error('Object ' + name + ': ' + value + ' length is ' + valueKeys.length + '. Less than minimum ' + minLen + '.');
    if (typeof maxLen !== 'undefined' && valueKeys.length > maxLen) throw new Error('Object ' + name + ': ' + value + ' length is ' + valueKeys.length + ' more than maximum ' + maxLen + '.');
    if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error('Object ' + name + ': ' + value + ' does not include required string from: ' + includesAny + '.');
    if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error('Object ' + name + ': ' + value + ' includes blacklisted string from: ' + notIncludesAny + '.');
    if (allChildren) valueKeys.forEach(function (valueKey) {
      return validate(value[valueKey], allChildren, { name: valueKey });
    });
    if (children) {
      if ((typeof children === 'undefined' ? 'undefined' : _typeof(children)) !== 'object' || Array.isArray(children)) throw new Error('Expected ' + name + ': ' + value + ' validation children to be type object. Got type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + ' Array.isArray? ' + Array.isArray(value) + '.');
      var modelKeys = Object.keys(children);

      modelKeys.forEach(function (modelKey) {
        validate(value[modelKey], children[modelKey], modelKey);
      });
    }
  }
}, {
  type: 'string',
  rules: function rules(value, validation, name) {
    var maxLen = validation.maxLen,
        minLen = validation.minLen,
        regEx = validation.regEx,
        includes = validation.includes,
        notIncludes = validation.notIncludes,
        includesAny = validation.includesAny,
        notIncludesAny = validation.notIncludesAny;

    if (typeof value !== 'string') throw new Error('Expected ' + name + ': ' + value + ' to be type string. Got type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
    if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error('String "' + name + ': ' + value + '" length is ' + value.length + '. Less than minimum ' + minLen + '.');
    if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error('String "' + name + ': ' + value + '" length is ' + value.length + '. more than maximum.');
    if (typeof regEx !== 'undefined' && !regEx.test(value)) throw new Error('String "' + name + ': ' + value + '" does not match the validation regEx ' + regEx + '.');
    if (typeof includes !== 'undefined' && !value.includes(includes)) throw new Error('String "' + name + ': ' + value + '" does not include required string: ' + includes + '.');
    if (typeof notIncludes !== 'undefined' && value.includes(notIncludes)) throw new Error('String "' + name + ': ' + value + '" includes blacklisted string: ' + notIncludes + '.');
    if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny)) throw new Error('String "' + name + ': ' + value + '" does not include any required string from: [' + includesAny + '].');
    if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny)) throw new Error('String "' + name + ': ' + value + '" includes a blacklisted string from: [' + notIncludesAny + '].');
  }
}, {
  type: 'number',
  rules: function rules(value, validation, name) {
    var max = validation.max,
        min = validation.min,
        decimals = validation.decimals,
        regEx = validation.regEx;

    if (typeof value !== 'number') throw new Error('Expected ' + name + ': ' + value + ' to be type number. Got ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
    if (typeof min !== 'undefined' && value < min) throw new Error('Number ' + name + ': ' + value + ' is less than minimum ' + min + '.');
    if (typeof max !== 'undefined' && value > max) throw new Error('Number ' + name + ': ' + value + ' is more than maximum ' + max + '.');
    var valDecimals = void 0;
    if (typeof decimals !== 'undefined' && function () {
      var stringArr = value.toString().split('.');
      if (stringArr[1]) {
        valDecimals = stringArr[1].length;
        return valDecimals > decimals;
      }
    }()) throw new Error('Number: ' + value + ' has ' + valDecimals + ' decimals. More than max ' + decimals + '.');
    if (typeof regEx !== 'undefined' && !regEx.test(value)) throw new Error('Number ' + name + ': ' + value + ' does not match regEx ' + regEx + '.');
  }
}, {
  type: 'boolean',
  rules: function rules(value, validation, name) {
    if (typeof value !== 'boolean') throw new Error('Expected ' + name + ': ' + value + ' to be type boolean. Got ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
  }
}, {
  type: 'email',
  rules: function rules(value, validation, name) {
    validate(value, {
      type: 'string',
      maxLen: 50,
      regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    }, { name: name });
  }
}];

// exports must be listed above validate require to avoid circular reference bug
module.exports = validations;
var validate = require('./validate');