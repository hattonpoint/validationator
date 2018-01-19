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
// validate.js
// ------------------------------------

const validate = (value, validation) => {
  const name = validation.name || ''
  const ON = (validation.on || validate.on)
  const OFF = (validation.off || validate.off)
  const WARN = (validation.warn || validate.warn)
  const BOOL = (validation.bool || validate.bool)

  const shouldBypassValidation = () => (process.env.NODE_ENV === 'production' || OFF) && (!ON || !BOOL)

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

  try {
    if (shouldBypassValidation()) return value
    if (Array.isArray(validation)) { runOrValidation(name) } else {
      // Check for missing value and run required checks
      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (BOOL) return true
          else return
        } else {
          if (WARN) console.warn(`Value '${name}: ${value}' is required!`)
          if (BOOL) return false
          else throw new Error(`Value '${name}: ${value}' is required!`)
        }
      }

      // Enable shorthand type
      if (typeof validation === 'string') validation = { type: validation }
      if (!validation.type) throw new Error(`${name}: ${value}.type is required`)
      if (validation.extend) validation.extend(value, validation)

      // ------------------------------------
      // validations
      // ------------------------------------

      let validations = [
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
                let currentModel = children[modelKey]
                if (typeof currentModel === 'string') currentModel = { type: currentModel }
                currentModel.name = currentModel.name || modelKey
                validate(value[modelKey], currentModel)
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
              name,
              maxLen: 50,
              regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            })
          }
        }
      ]

      // ------------------------------------
      // validations end
      // ------------------------------------

      if (validate.extensions) validations = [ ...validations, ...validate.extensions ]

      validations.forEach(currentValidation => {
        if (validation.type.toLowerCase() === currentValidation.type) {
          currentValidation.rules(value, validation, name)
        }
      })

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
    params = Array.isArray(params) ? params : [ params ]
    if ((process.env.NODE_ENV === 'production' || options.off) && !options.on) return func(...params)

    const inputModel = func.inputModel
    const outputModel = func.outputModel

    if (!func) throw new Error('Missing required argument func')
    if (typeof func !== 'function') throw new Error('First argument is not a function!')
    if (!inputModel && !outputModel) throw new Error(`ERROR: No validation props set for ${name}. Please specify ${name}.inputModel or ${name}.outputModel`)

    if (inputModel && !outputModel) {
      validateInput(params, inputModel, func, name)
    }

    if (outputModel && !inputModel) {
      validate(func(...params), outputModel, { name })
    }

    if (inputModel && outputModel) {
      validateInput(params, inputModel, func, name)
      validate(func(...params), outputModel, { name })
    }
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

  if (typeof inputModel.type === 'string' || typeof inputModel === 'string') { // single parameter
    if (params.length > 1) throw new Error(`ERROR: ${name} expected 1 parameter but received ${params.length}`)
    validate(params[0], inputModel, { name: paramNames[0] })
    return
  }

  if (Array.isArray(inputModel)) { // multiple parameters
    if (inputModel.length !== paramNames.length) throw new Error(`ERROR: parameters and input model for ${name} are out of sync. There are ${inputModel.length} entries to the inputModel and ${paramNames.length} paramerters.`)
    if (!Array.isArray(params)) throw new Error(`ERROR: Multiple params must me passed into validateFunc as an array.`)
    inputModel.forEach((model, i) => {
      validate(params[i], model, { name: paramNames[i] })
    })
    return
  }

  if (typeof inputModel === 'object') { // object deconstruction params
    params = params[0]
    if (typeof params !== 'object' || Array.isArray(params)) throw new Error(`Error: Expected a single object as the sole function param (ES6 parameter destructuring).`)
    const modelKeys = Object.keys(inputModel)
    const paramKeys = Object.keys(params)

    if (modelKeys.length !== paramKeys.length) throw new Error(`ERROR: parameters and input model for ${name} are out of sync. There are ${modelKeys.length} entries to the inputModel and ${paramKeys.length} paramerters.`)

    paramKeys.forEach(paramKey => {
      if (!matchesAny(paramKey, paramNames)) throw new Error(`ERROR: The paramKey '${paramKey}' does not match any of the available parameters: ${paramNames.toString()}`)
      if (!matchesAny(paramKey, modelKeys)) throw new Error(`ERROR: The paramKey '${paramKey}' has not been included ${name}.inputModel`)
    })

    modelKeys.forEach(modelKey => {
      validate(params[modelKey], inputModel[modelKey], { name: modelKey })
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
    validateFunc
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
