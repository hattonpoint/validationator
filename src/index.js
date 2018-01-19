// common/require.js not used because of its perfomance impact
// there are more operations included in a require than most validations

// ------------------------------------
// Utilities
// ------------------------------------

const getFuncParamNames = func => {
  const STRIP_COMMENTS_DEFAULTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg
  const ARGUMENT_NAMES = /([^\s,]+)/g
  const fnStr = func.toString().replace(STRIP_COMMENTS_DEFAULTS, '')
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if (result[0] === '{' && result[result.length - 1 === '}']) result = result.slice(1, -1)
  if (result === null) result = []
  return result
}

const includesAnyTest = (str, arrOfStr, options = {}) => {
  let includesAny = false

  if (options.ignoreCase) str = str.toLowerCase()
  if (options.stringify) str = JSON.stringify(str)

  for (let i = 0; i < arrOfStr.length; i++) {
    let search = arrOfStr[i]

    if (options.ignoreCase) search = search.toLowerCase()
    if (options.stringify) search = JSON.stringify(search)

    if (str.includes(search)) {
      includesAny = true
      break
    }
  }

  return includesAny
}

const matchesAny = (test, arr) => {
  let returnVal = false
  arr.forEach(item => {
    if (item === test) returnVal = true
  })
  return returnVal
}

// ------------------------------------
// validations
// ------------------------------------

const validator = require('validator')

const validationsMaster = {
  array: (value, { maxLen, minLen, allChildren, children, includes, notIncludes, includesAny, notIncludesAny, name }) => {
    if (!Array.isArray(value)) throw new Error(`Expected ${name}: ${value} to be type array. Got ${typeof value}.`)
    if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error(`Array ${name}: ${value} length is ${value.length}. Less than minimum ${minLen}.`)
    if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error(`Array ${name}: ${value} is ${value.length}. More than maximum ${maxLen}.`)
    if (typeof includes !== 'undefined' && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error(`Array ${name}: ${value} does not include required string: ${includes}.`)
    if (typeof notIncludes !== 'undefined' && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error(`Array ${name}: ${value} includes blacklisted string: ${notIncludes}.`)
    if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} does not include required string from: ${includesAny}.`)
    if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} includes blacklisted string from: ${notIncludesAny}.`)
    if (allChildren) {
      value.forEach((item, i) => {
        allChildren.name = allChildren.name || i
        validate(value[i], allChildren)
      })
    }
    if (children) {
      if (!Array.isArray(children)) throw new Error(`${name}: ${value}. Children must be an array. Got type ${typeof children}.`)
      children.forEach((model, i) => {
        if (typeof model === 'string') model = { type: model }
        model.name = model.name || i
        validate(value[i], model)
      })
    }
  },

  function: (value, { name }) => {
    if (typeof value !== 'function') throw new Error(`Expected ${name}: ${value} to be type function. Got ${typeof value}.`)
  },

  object: (value, { requiredKeys, children, minLen, maxLen, allChildren, includes, notIncludes, includesAny, notIncludesAny, name }) => {
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
        let currentModel = children[modelKey]
        if (typeof currentModel === 'string') currentModel = { type: currentModel }
        currentModel.name = currentModel.name || modelKey
        validate(value[modelKey], currentModel)
      })
    }
  },

  string: (value, { maxLen, minLen, regEx, includes, notIncludes, includesAny, notIncludesAny, name }) => {
    if (typeof value !== 'string') throw new Error(`Expected ${name}: ${value} to be type string. Got type ${typeof value}.`)
    if (typeof minLen !== 'undefined' && value.length < minLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. Less than minimum ${minLen}.`)
    if (typeof maxLen !== 'undefined' && value.length > maxLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. more than maximum.`)
    if (typeof regEx !== 'undefined' && !regEx.test(value)) throw new Error(`String "${name}: ${value}" does not match the validation regEx ${regEx}.`)
    if (typeof includes !== 'undefined' && !value.includes(includes)) throw new Error(`String "${name}: ${value}" does not include required string: ${includes}.`)
    if (typeof notIncludes !== 'undefined' && value.includes(notIncludes)) throw new Error(`String "${name}: ${value}" includes blacklisted string: ${notIncludes}.`)
    if (typeof includesAny !== 'undefined' && !includesAnyTest(value, includesAny)) throw new Error(`String "${name}: ${value}" does not include any required string from: [${includesAny}].`)
    if (typeof notIncludesAny !== 'undefined' && includesAnyTest(value, notIncludesAny)) throw new Error(`String "${name}: ${value}" includes a blacklisted string from: [${notIncludesAny}].`)
  },

  number: (value, { max, min, decimals, regEx, name }) => {
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
  },

  boolean: (value, { name }) => {
    if (typeof value !== 'boolean') throw new Error(`Expected ${name}: ${value} to be type boolean. Got ${typeof value}.`)
  },

  email: (value, validation) => {
    validate(value, {
      type: 'string',
      name: validation.name,
      maxLen: 50,
      regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    })
  },

  'string-int': (value, validation) => {
    validate(parseInt(value), Object.assign(
      validation,
      { type: 'number', name: 'string-int' }
    ))
  },

  'postal-code': value => {
    validate(value, ['string', 'number'])
    value = `${value}` // convert to string if not number
    validate(value, {
      type: 'string',
      name: 'postal-code',
      regEx: /^\d{5}(?:[-\s]\d{4})?$/
    })
  },

  url: (value, options) => {
    validate(value, 'string')
    if (!validator.isURL(value, options)) throw new Error(`URL ${value} did not match the validation: ${options}`)
  },

  date: value => {
    validate(value, {
      type: 'string',
      name: 'date',
      regEx: /(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)[0-9]{2}/
    })
  },

  phone: value => {
    validate(value, ['string', 'number'])
    value = `${value}` // convert to string if not number
    validate(value, {
      type: 'string',
      name: 'phone',
      regEx: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
    })
  },

  alpha: value => {
    validate(value, 'string')
    if (!validator.isAlpha(value)) throw new Error(`string: ${value} is not alpha numeric.`)
  }
}

// ------------------------------------
// validate.js
// ------------------------------------

const validate = (value, validation) => {
  // setting up definitions
  validation.name = validation.name || ''
  const name = validation.name
  const ON = (validation.on || validate.on)
  const OFF = (validation.off || validate.off)
  const WARN = (validation.warn || validate.warn)
  const BOOL = (validation.bool || validate.bool)

  // check for validation bypass early for performance
  const shouldBypassValidation = () => (process.env.NODE_ENV === 'production' || OFF) && (!ON || !BOOL)
  if (shouldBypassValidation()) return value

  // function definitions
  const runOrValidation = name => {
    let failedCount = 0
    let validationOptions = []
    validation.forEach(option => {
      validationOptions.push(option)
      try {
        validate(value, option)
      } catch (err) {
        failedCount++
      }
    })
    if (failedCount === validationOptions.length) throw new Error(`${name}: ${value} did not match any of the types: ${validationOptions.toString()}`)
  }

  const isAcceptedNull = value => {
    let returnVal = false
    if (validation.acceptedNulls) {
      validation.acceptedNulls.forEach(nullVal => {
        if (nullVal === value) returnVal = true
      })
    }
    return returnVal
  }

  // start validate execution
  try {
    // check if single or multi model validation
    if (Array.isArray(validation)) runOrValidation(name)
    else { // run single validation
      // Check for missing value and run required and acceptedNull checks
      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (BOOL) return true
          else return
        } else {
          if (WARN) console.warn(`Value ${name}: ${value} is required!`)
          if (BOOL) return false
          else throw new Error(`Value ${name}: ${value} is required!`)
        }
      }

      // Enable shorthand type check
      if (typeof validation === 'string') validation = { type: validation }
      if (!validation.type) throw new Error(`${name}: ${value}.type is required`)
      if (validation.extend) validation.extend(value, validation)

      // craft validation set
      let validations = validate.only ? validate.only : validationsMaster
      if (validate.extensions) validations = { ...validations, ...validate.extensions }
      const validationTypes = Object.keys(validations)

      validationTypes.forEach(type => {
        if (validation.type.toLowerCase() === type) {
          validations[type](value, validation)
        }
      })

      // options, options, options
      if (BOOL) return true
      else return value
    }
  } catch (err) {
    if (WARN && !BOOL) {
      console.warn(err)
      return value
    } else if (BOOL) {
      if (WARN) console.warn(err)
      return false
    } else {
      throw err
    }
  }
}

// ------------------------------------
// validateFunc
// ------------------------------------

const validateFunc = (func, params, options = {}) => {
  try {
    const name = options.name || func.name
    // conform param type to array
    params = Array.isArray(params) ? params : [ params ]
    // check to see if validation should be bypassed
    if ((process.env.NODE_ENV === 'production' || options.off) && !options.on) return func(...params)

    if (!func) throw new Error('Missing required argument func')
    if (typeof func !== 'function') throw new Error('First argument is not a function!')

    const inputModel = func.inputModel
    const outputModel = func.outputModel

    if (inputModel) validateInput(params, inputModel, func, name)
    if (outputModel) validate(func(...params), outputModel)
  } catch (err) {
    if (options.warn) {
      console.warn(err)
      return func(...params)
    } else {
      throw err
    }
  }

  return func(...params)
}

const validateInput = (params, inputModel, func, name) => {
  const paramNames = getFuncParamNames(func)
  // enable shorthand type check
  if (typeof inputModel === 'string') inputModel = { type: inputModel }

  // single parameter
  if (typeof inputModel.type === 'string') {
    if (params.length > 1) throw new Error(`ERROR: ${name} expected 1 parameter but received ${params.length}`)
    inputModel.name = inputModel.name || paramNames[0]
    validate(params[0], inputModel)
    return
  }

  // multiple parameters
  if (Array.isArray(inputModel)) {
    if (!Array.isArray(params)) throw new Error(`ERROR: Multiple params must me passed into validateFunc as an array.`)
    inputModel.forEach((model, i) => {
      model.name = model.name || i
      validate(params[i], model)
    })
    return
  }

  // object deconstruction params
  if (typeof inputModel === 'object') {
    params = params[0]
    if (typeof params !== 'object' || Array.isArray(params)) throw new Error(`Error: Expected a single object as the sole function param (ES6 parameter destructuring).`)
    const modelKeys = Object.keys(inputModel)
    const paramKeys = Object.keys(params)

    paramKeys.forEach(paramKey => {
      if (!matchesAny(paramKey, paramNames)) throw new Error(`ERROR: The paramKey '${paramKey}' does not match any of the available parameters: ${paramNames.toString()}`)
    })

    modelKeys.forEach(modelKey => {
      inputModel[modelKey].name = inputModel[modelKey].name || modelKey
      validate(params[modelKey], inputModel[modelKey])
    })
    return
  }
  throw new Error(`UNKNOWN ERROR: the function input model did not match the api spec.`)
}

// ------------------------------------
// exports
// ------------------------------------

(root => {
  var _ = {
    validate,
    validateFunc,
    validations: validationsMaster
  }

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _
    root._ = _
  } else {
    root._ = _
  }
})(this)
