const { includesAny: includesAnyTest } = require('ians-utils')

const validations = [
  {
    type: 'array',
    rules: (value, validation, name) => {
      const { maxLen, minLen, allChildren, children, includes, notIncludes, includesAny, notIncludesAny } = validation
      if (!Array.isArray(value)) throw new Error(`Expected ${name}: ${value} to be type array. Got ${typeof value}.`)
      if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error(`Array ${name}: ${value} length is ${value.length}. Less than minimum ${minLen}.`)
      if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error(`Array ${name}: ${value} is ${value.length}. More than maximum ${maxLen}.`)
      if (typeof includes !== 'undefined' && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error(`Array ${name}: ${value} does not include required string: ${includes}.`)
      if (typeof notIncludes !== 'undefined' && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error(`Array ${name}: ${value} includes blacklisted string: ${notIncludes}.`)
      if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} does not include required string from: ${includesAny}.`)
      if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} includes blacklisted string from: ${notIncludesAny}.`)
      if (allChildren) value.forEach((item, i) => validate(value[i], allChildren, { name: i }))
      if (children) {
        if (!Array.isArray(children)) throw new Error(`${name}: ${value}. Children must be an array. Got type ${typeof children}.`)
        console.log('validate :  : ', validate)
        children.forEach((model, i) => {
          validate(value[i], model, { name: i })
        })
      }
    }
  }, {
    type: 'function',
    rules: (value, validation, name) => {
      if (typeof value !== 'function') throw new Error(`Expected ${name}: ${value} to be type function. Got ${typeof value}.`)
    }
  }, {
    type: 'object',
    rules: (value, validation, name) => {
      const { requiredKeys, children, minLen, maxLen, allChildren, includes, notIncludes, includesAny, notIncludesAny } = validation
      const valueKeys = Object.keys(value)
      if (typeof value !== 'object' || Array.isArray(value)) throw new Error(`Expected ${name}: ${value} to be type object. Got type ${typeof value}. Array.isArray? ${Array.isArray(value)}.`)
      if (requiredKeys) {
        requiredKeys.forEach(requiredKey => {
          if (!valueKeys.find(valueKey => valueKey === requiredKey)) throw new Error(`${name}: ${value} missing required key: ${requiredKey}.`)
        })
      }
      if (typeof includes !== 'undefined' && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error(`Object ${name}: ${value} does not include required string: ${includes}.`)
      if (typeof notIncludes !== 'undefined' && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error(`Object ${name}: ${value} includes blacklisted string: ${notIncludes}.`)
      if (typeof minLen !== 'undefined' && valueKeys.length < minLen) throw new Error(`Object ${name}: ${value} length is ${valueKeys.length}. Less than minimum ${minLen}.`)
      if (typeof maxLen !== 'undefined' && valueKeys.length > maxLen) throw new Error(`Object ${name}: ${value} length is ${valueKeys.length} more than maximum ${maxLen}.`)
      if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error(`Object ${name}: ${value} does not include required string from: ${includesAny}.`)
      if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error(`Object ${name}: ${value} includes blacklisted string from: ${notIncludesAny}.`)
      if (allChildren) valueKeys.forEach(valueKey => validate(value[valueKey], allChildren, { name: valueKey }))
      if (children) {
        if (typeof children !== 'object' || Array.isArray(children)) throw new Error(`Expected ${name}: ${value} validation children to be type object. Got type ${typeof value} Array.isArray? ${Array.isArray(value)}.`)
        const modelKeys = Object.keys(children)

        modelKeys.forEach(modelKey => {
          validate(value[modelKey], children[modelKey], modelKey)
        })
      }
    }
  }, {
    type: 'string',
    rules: (value, validation, name) => {
      const { maxLen, minLen, regEx, includes, notIncludes, includesAny, notIncludesAny } = validation
      if (typeof value !== 'string') throw new Error(`Expected ${name}: ${value} to be type string. Got type ${typeof value}.`)
      if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. Less than minimum ${minLen}.`)
      if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. more than maximum.`)
      if (typeof regEx !== 'undefined' && !regEx.test(value)) throw new Error(`String "${name}: ${value}" does not match the validation regEx ${regEx}.`)
      if (typeof includes !== 'undefined' && !value.includes(includes)) throw new Error(`String "${name}: ${value}" does not include required string: ${includes}.`)
      if (typeof notIncludes !== 'undefined' && value.includes(notIncludes)) throw new Error(`String "${name}: ${value}" includes blacklisted string: ${notIncludes}.`)
      if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny)) throw new Error(`String "${name}: ${value}" does not include any required string from: [${includesAny}].`)
      if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny)) throw new Error(`String "${name}: ${value}" includes a blacklisted string from: [${notIncludesAny}].`)
    }
  }, {
    type: 'number',
    rules: (value, validation, name) => {
      const { max, min, decimals, regEx } = validation
      if (typeof value !== 'number') throw new Error(`Expected ${name}: ${value} to be type number. Got ${typeof value}.`)
      if (typeof min !== 'undefined' && value < min) throw new Error(`Number ${name}: ${value} is less than minimum ${min}.`)
      if (typeof max !== 'undefined' && value > max) throw new Error(`Number ${name}: ${value} is more than maximum ${max}.`)
      let valDecimals
      if (typeof decimals !== 'undefined' && (() => {
        const stringArr = value.toString().split('.')
        if (stringArr[1]) {
          valDecimals = stringArr[1].length
          return valDecimals > decimals
        }
      })()) throw new Error(`Number: ${value} has ${valDecimals} decimals. More than max ${decimals}.`)
      if (typeof regEx !== 'undefined' && !regEx.test(value)) throw new Error(`Number ${name}: ${value} does not match regEx ${regEx}.`)
    }
  }, {
    type: 'boolean',
    rules: (value, validation, name) => {
      if (typeof value !== 'boolean') throw new Error(`Expected ${name}: ${value} to be type boolean. Got ${typeof value}.`)
    }
  }, {
    type: 'email',
    rules: (value, validation, name) => {
      validate(value, {
        type: 'string',
        maxLen: 50,
        regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      }, { name })
    }
  }
]

// exports must be listed above validate require to avoid circular reference bug
module.exports = validations
const validate = require('./validate')
