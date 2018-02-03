const validator = require('validator')
const { get } = require('lodash')

// ------------------------------------
// Utilities
// ------------------------------------

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

// ------------------------------------
// validations
// ------------------------------------

const validationsMaster = {
  'array': (value, { maxLen, minLen, allChildren, children, includes, notIncludes, includesAny, notIncludesAny, name }) => {
    if (!Array.isArray(value)) throw new Error(`Expected ${name}: ${value} to be type array. Got ${typeof value}.`)
    if (minLen && value.length < minLen) throw new Error(`Array ${name}: ${value} length is ${value.length}. Less than minimum ${minLen}.`)
    if (maxLen && value.length > maxLen) throw new Error(`Array ${name}: ${value} is ${value.length}. More than maximum ${maxLen}.`)
    if (includes && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error(`Array ${name}: ${value} does not include required string: ${includes}.`)
    if (notIncludes && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error(`Array ${name}: ${value} includes blacklisted string: ${notIncludes}.`)
    if (includesAny && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} does not include required string from: ${includesAny}.`)
    if (notIncludesAny && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error(`Array ${name}: ${value} includes blacklisted string from: ${notIncludesAny}.`)

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

  'function': (value, { name }) => {
    if (typeof value !== 'function') throw new Error(`Expected ${name}: ${value} to be type function. Got ${typeof value}.`)
  },

  'object': (value, { requiredKeys, children, minLen, maxLen, allChildren, includes, notIncludes, includesAny, notIncludesAny, name, isInstance }) => {
    const valueKeys = Object.keys(value)
    if ((typeof value !== 'object' || Array.isArray(value)) && !isInstance) throw new Error(`Expected ${name}: ${value} to be type object. Got type ${typeof value}. Array.isArray? ${Array.isArray(value)}.`)
    if (includes && !JSON.stringify(value).includes(JSON.stringify(includes))) throw new Error(`Object ${name}: ${value} does not include required string: ${includes}.`)
    if (notIncludes && JSON.stringify(value).includes(JSON.stringify(notIncludes))) throw new Error(`Object ${name}: ${value} includes blacklisted string: ${notIncludes}.`)
    if (minLen && valueKeys.length < minLen) throw new Error(`Object ${name}: ${value} length is ${valueKeys.length}. Less than minimum ${minLen}.`)
    if (maxLen && valueKeys.length > maxLen) throw new Error(`Object ${name}: ${value} length is ${valueKeys.length} more than maximum ${maxLen}.`)
    if (includesAny && !includesAnyTest(value, includesAny, { stringify: true })) throw new Error(`Object ${name}: ${value} does not include required string from: ${includesAny}.`)
    if (notIncludesAny && includesAnyTest(value, notIncludesAny, { stringify: true })) throw new Error(`Object ${name}: ${value} includes blacklisted string from: ${notIncludesAny}.`)
    if (allChildren) valueKeys.forEach(valueKey => validate(value[valueKey], allChildren, { name: valueKey }))

    if (requiredKeys) {
      requiredKeys.forEach(requiredKey => {
        if (!valueKeys.find(valueKey => valueKey === requiredKey)) throw new Error(`${name}: ${value} missing required key: ${requiredKey}.`)
      })
    }

    if (children) {
      if (typeof children !== 'object' || Array.isArray(children)) throw new Error(`Expected ${name}: ${value} validation children to be type object. Got type ${typeof value} Array.isArray? ${Array.isArray(value)}.`)
      const modelKeys = Object.keys(children)
      modelKeys.forEach(modelKey => {
        let currentModel = children[modelKey]
        currentModel.name = currentModel.name || modelKey
        validate(value[modelKey], currentModel)
      })
    }
  },

  'string': (value, options) => {
    const { maxLen, minLen, regEx, includes, notIncludes, includesAny, notIncludesAny, name } = options
    if (typeof value !== 'string') throw new Error(`Expected ${name}: ${value} to be type string. Got type ${typeof value}.`)
    if (minLen  && value.length < minLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. Less than minimum ${minLen}.`)
    if (maxLen && value.length > maxLen) throw new Error(`String "${name}: ${value}" length is ${value.length}. more than maximum.`)
    if (regEx && !regEx.test(value)) throw new Error(`String "${name}: ${value}" does not match the validation regEx ${regEx}.`)
    if (includes && !value.includes(includes)) throw new Error(`String "${name}: ${value}" does not include required string: ${includes}.`)
    if (notIncludes && value.includes(notIncludes)) throw new Error(`String "${name}: ${value}" includes blacklisted string: ${notIncludes}.`)
    if (includesAny && !includesAnyTest(value, includesAny)) throw new Error(`String "${name}: ${value}" does not include any required string from: [${includesAny}].`)
    if (notIncludesAny && includesAnyTest(value, notIncludesAny)) throw new Error(`String "${name}: ${value}" includes a blacklisted string from: [${notIncludesAny}].`)
    if ('upperCase' in options & !validator.isUppercase(value)) throw new Error(`String: ${name}: ${value} is not uppercase!`)
    if ('lowerCase' in options & !validator.isLowercase(value)) throw new Error(`String: ${name}: ${value} is not lowercase!`)
  },

  'number': (value, { max, min, decimals, regEx, name }) => {
    if (typeof value !== 'number') throw new Error(`Expected ${name}: ${value} to be type number. Got ${typeof value}.`)
    if (min && value < min) throw new Error(`Number ${name}: ${value} is less than minimum ${min}.`)
    if (max && value > max) throw new Error(`Number ${name}: ${value} is more than maximum ${max}.`)
    if (regEx && !regEx.test(value)) throw new Error(`Number ${name}: ${value} does not match regEx ${regEx}.`)

    let valDecimals
    if (typeof decimals !== 'undefined' && (() => {
      const stringArr = value.toString().split('.')
      if (stringArr[1]) {
        valDecimals = stringArr[1].length
        return valDecimals > decimals
      }
    })()) throw new Error(`Number: ${value} has ${valDecimals} decimals. More than max ${decimals}.`)
  },

  'boolean': (value, { name }) => {
    if (typeof value !== 'boolean') throw new Error(`Expected ${name}: ${value} to be type boolean. Got ${typeof value}.`)
  },

  'bool': (value, { name }) => {
    if (typeof value !== 'boolean') throw new Error(`Expected ${name}: ${value} to be type boolean. Got ${typeof value}.`)
  },

  'instance': (value, options) => {
    const { of } = options
    if (!of || typeof of !== 'function') throw new Error(`Instance validation for ${value} failed. Must provide constructor through the "of" option.`)
    if ('strict' in options) {
      if (value.constructor !== of) throw new Error(`value: ${value} is not a strict instance of ${of}`)
    } else {
      if (!(value instanceof of)) throw new Error(`value: ${value} is not an instance of ${of}`)
    }
    validate(value, Object.assign({}, options, { type: Object, isInstance: true }))
  },

  'email': (value, options) => {
    validate(value, 'string')
    if (!validator.isEmail(value, options)) throw new Error(`string: ${value} does not match email validation with options: ${options}`)
  },

  'is': (value, { exactly }) => {
    if (typeof value !== typeof exactly || JSON.stringify(value) !== JSON.stringify(exactly)) throw new Error(`value: ${value} is not exactly equal to ${exactly}`)
  },

  'string-int': (value, validation) => {
    validate(parseInt(value), Object.assign(
      validation,
      { type: 'number', name: 'string-int' }
    ))
  },

  'postal-code': (value, { state }) => {
    validate(value, ['string', 'number'])
    state = state || 'any'
    value = `${value}` // convert to string if not number
    if (!validator.isPostalCode(value, state)) throw new Error(`value: ${value} is not a valid postal code ${state ? ` for state ${state}` : ''}`)
  },

  'url': (value, options) => {
    validate(value, 'string')
    if (!validator.isURL(value, options)) throw new Error(`URL ${value} did not match the validation: ${options}`)
  },

  'date': value => {
    if (!validator.toDate(value)) throw new Error(`value: ${value} is not a valid date`)
  },

  'date-obj': value => {
    validate(value, 'object')
    if (Object.prototype.toString.call(value) !== '[object Date]') throw new Error(`value: ${value} is not a valid date object`)
  },

  'phone': (value, { mobile }) => {
    validate(value, ['string', 'number'])
    value = `${value}` // convert to string if not number
    validate(value, {
      type: 'string',
      name: 'phone',
      regEx: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
    })
    if (mobile === true) mobile = 'any'
    if (mobile) validate.isMobilePhone(value, mobile)
  },

  'alpha': (value, { locale }) => {
    validate(value, 'string')
    if (!validator.isAlpha(value, locale)) throw new Error(`string: ${value} is not alpha.`)
  },

  'alpha-numeric': (value, { locale }) => {
    validate(value, ['string', 'number'])
    if (!validator.isAlphanumeric(value, locale)) throw new Error(`value: ${value} is not alpha numeric.`)
  },

  'ascii': value => {
    validate(value, 'string')
    if (!validator.isAlphanumeric(value)) throw new Error(`string: ${value} is not an ascii string.`)
  },

  'base64': value => {
    validate(value, 'string')
    if (!validator.isBase64(value)) throw new Error(`string: ${value} is not a base64 string.`)
  },

  'credit-card': value => {
    validate(value, ['string', 'number'])
    if (!validator.isCreditCard(value)) throw new Error(`value: ${value} is not a valid credit card number.`)
  },

  'currency': (value, options) => {
    if (!validator.isCurrency(value, options)) throw new Error(`value: ${value} is not a valid currency with options: ${options}.`)
  },

  'data-uri': value => {
    validate(value, 'string')
    if (!validator.isDataURI(value)) throw new Error(`value: ${value} is not a valid data URI.`)
  },

  'fqdn': (value, options) => {
    validate(value, 'string')
    if (!validator.isFQDN(value, options)) throw new Error(`value: ${value} is not a valid fully qualified domain name.`)
  },

  'float': (value, options) => {
    validate(value, 'number')
    if (!validator.isFloat(value, options)) throw new Error(`value: ${value} is not a valid float.`)
  },

  'hash': (value, { algorithm }) => {
    if (!validator.isFloat(value, algorithm)) throw new Error(`value: ${value} is not a valid ${algorithm} hash.`)
  },

  'hex-color': value => {
    if (!validator.isFloat(value)) throw new Error(`value: ${value} is not a valid hex color.`)
  },

  'hex-dec': value => {
    if (!validator.isHexadecimal(value)) throw new Error(`value: ${value} is not a valid hexadecimal.`)
  },

  'ip': (value, { version }) => {
    if (!validator.isIP(value)) throw new Error(`value: ${value} is not a valid IP v. ${version}.`)
  },

  'isbn': (value, { version }) => {
    if (!validator.isIP(value)) throw new Error(`value: ${value} is not a valid ISBN v. ${version}.`)
  },

  'issn': (value, options) => {
    if (!validator.isISSN(value, options)) throw new Error(`value: ${value} is not a valid ISSN with options ${options}.`)
  },

  'isin': value => {
    if (!validator.isISIN(value)) throw new Error(`value: ${value} is not a valid ISIN (stock/security identifier).`)
  },

  'iso8601': value => {
    if (!validator.isISO8601(value)) throw new Error(`value: ${value} is not a valid ISO8601.`)
  },

  'isrc': value => {
    if (!validator.isISRC(value)) throw new Error(`value: ${value} is not a valid ISRC.`)
  },

  'int': (value, options) => {
    if (!validator.isInt(value, options)) throw new Error(`value: ${value} is not a valid int with options: ${options}.`)
  },

  'json': value => {
    if (!validator.isJSON(value)) throw new Error(`value: ${value} is not a valid JSON.`)
  },

  'lat-long': value => {
    if (!validator.isLatLong(value)) throw new Error(`value: ${value} is not a valid lat-long.`)
  },

  'mac': value => {
    if (!validator.isMACAddress(value)) throw new Error(`value: ${value} is not a valid MAC address.`)
  },

  'md5': value => {
    if (!validator.isMD5(value)) throw new Error(`value: ${value} is not a valid MD5 hash.`)
  },

  'mime-type': value => {
    if (!validator.isMimeType(value)) throw new Error(`value: ${value} is not a valid mime type.`)
  },

  'mongo-id': value => {
    if (!validator.isMongoId(value)) throw new Error(`value: ${value} is not a valid mongo-id.`)
  },

  'port': value => {
    if (!validator.isPort(value)) throw new Error(`value: ${value} is not a valid port number.`)
  },

  'uuid': value => {
    if (!validator.isUUID(value)) throw new Error(`value: ${value} is not a valid UUID.`)
  }
}

// ------------------------------------
// validate.js
// ------------------------------------

const validate = (value, validation) => {
  // setting up definitions
  const name = validation.name || ''
  const ON = (validation.on || validate.on)
  const OFF = (validation.off || validate.off)
  const WARN = (validation.warn || validate.warn)
  const BOOL = (validation.bool || validate.bool)
  const PROD = process.env.NODE_ENV === 'production'

  // check for validation bypass early for performance
  if ((PROD || OFF) && (!ON || !BOOL)) return value

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

      // Enable primative based api
      if (typeof validation === 'function') { validation = { type: name } }
      if (typeof validation.type === 'function') { validation.type = validation.type.name }
      [ 'Boolean', 'Number', 'String', 'Object', 'Array', 'Function' ].forEach(primative => {
        if (typeof validation[primative] === 'function') { validation.type = validation[primative].name }
      })

      // check to make sure that a type was set
      if (!validation.type) throw new Error(`${name}: ${value}.type is required`)

      // enable shared extend validation option
      if (validation.extend) validation.extend(value, validation)

      // craft validation set
      let validations = validate.only ? validate.only : validationsMaster
      if (validate.extensions) validations = Object.assign({}, validations, validate.extensions)
      const validationTypes = Object.keys(validations)

      // run validation loop
      let validationFound = false
      validationTypes.forEach(type => {
        if (validation.type.toLowerCase() === type) {
          validations[type](value, validation)
          validationFound = true
        }
      })

      // catch missing validation types
      if (!validationFound) throw new Error(`valitaion type: ${validation.type} not found!`)

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
// type
// ------------------------------------

const type = (dataType, value, validationModel = {}) => {
  // setting up definitions
  const ON = (validationModel.on || type.on)
  const OFF = (validationModel.off || type.off)
  const WARN = (validationModel.warn || type.warn)
  const BOOL = (validationModel.bool || type.bool)
  const PROD = process.env.NODE_ENV === 'production'

  // check for validation bypass early for performance
  if ((PROD || OFF) && (!ON || !BOOL)) return value

  // wrap validate core
  // handle options
  try {
    if (validationModel) {
      if (typeof dataType !== 'object') dataType = { type: dataType }
      if (validationModel.type) validate(value, validationModel)
      return validate(value, Object.assign({}, validationModel, dataType))
    } else {
      return validate(value, dataType)
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

const validateFunc = (func, params, validation = {}) => {
  // check inputs
  if (!func) throw new Error('Missing required argument func')
  if (typeof func !== 'function') throw new Error('First argument is not a function!')

  // setting up definitions
  const name = validation.name || func.name || ''
  const ON = (validation.on || validateFunc.on)
  const OFF = (validation.off || validateFunc.off)
  const WARN = (validation.warn || validateFunc.warn)
  const PROD = process.env.NODE_ENV === 'production'
  const inputModel = validation.inputModel || func.inputModel
  const outputModel = validation.outputModel || func.outputModel

  // conform param type to array
  params = Array.isArray(params) ? params : [ params ]

  // allow for the validation of constructors as well
  const returnVal = (() => {
    // identify constructors to return validated instances
    if (validate(func.name[0], { String, upperCase: true, bool: true })) {
      return new func(...params) // eslint-disable-line
    } else {
      return func(...params)
    }
  })()

  // check to see if validation should be bypassed
  if ((PROD || OFF) && !ON) return returnVal

  try {
    // look for undefined output
    if ((('outputModel' in validation && !outputModel) ||
      ('outputModel' in func && !outputModel)) &&
      returnVal !== undefined) throw new Error(`Expected an undefined retrun value but ${typeof returnVal} was found`)

    // run validations
    if (inputModel) validateInput(params, inputModel, func, name)
    if (outputModel) validate(returnVal, outputModel)
  } catch (err) {
    if (WARN) {
      console.warn(err)
      return returnVal
    } else {
      throw err
    }
  }

  return returnVal
}

const validateInput = (params, inputModel, func, name) => {
  // enable shorthand type check
  if (typeof inputModel === 'string' || typeof inputModel === 'function') inputModel = { type: inputModel }

  // single parameter
  if (typeof inputModel.type === 'string' || typeof inputModel.type === 'function') {
    if (params.length > 1) throw new Error(`ERROR: ${name} expected 1 parameter but received ${params.length}`)
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

    modelKeys.forEach(modelKey => {
      inputModel[modelKey].name = inputModel[modelKey].name || modelKey
      validate(params[modelKey], inputModel[modelKey])
    })
    return
  }
  throw new Error(`UNKNOWN ERROR: the function inputModel: ${inputModel} did not match the api spec.`)
}

// ------------------------------------
// typeFunc
// ------------------------------------

const typeFunc = (func, options) => {
  return params => validateFunc(func, params, options)
}

// ------------------------------------
// typeClass
// ------------------------------------

const typeClass = (Constructor, classModel) => {
  classModel = classModel || Constructor.classModel || Constructor.model
  const propKeys = Object.keys(classModel.props)
  const methodKeys = Object.keys(classModel.methods)

  const TypedClass = class TypedClass {
    constructor (params) {
      this.baseClass = validateFunc(Constructor, params, {
        inputModel: classModel.constructor
      })
      this.baseName = Constructor.name
    }
  }

  propKeys.forEach(function (propKey) {
    TypedClass.prototype[propKey] = function () {
      const instance = this
      return instance.baseClass[propKey]
    }

    TypedClass.prototype[`set${propKey[0].toUpperCase()}${propKey.slice(1)}`] = function (set) {
      const instance = this
      instance.baseClass[propKey] = validate(set, classModel.props[propKey])
      return instance.baseClass[propKey]
    }
  })

  methodKeys.forEach(function (methodKey) {
    TypedClass.prototype[methodKey] = function (params) {
      const instance = this
      return validateFunc(instance.baseClass[methodKey].bind(instance.baseClass), params, {
        inputModel: classModel.methods[methodKey].inputModel,
        outputModel: classModel.methods[methodKey].outputModel
      })
    }
  })

  return TypedClass
}

// ------------------------------------
// TypedClass
// ------------------------------------

const TypedClass = class TypedClass {
  setProps (changes) {
    Object.keys(changes).forEach(changeKey => {
      if (get(this.constructor, `model.props.${changeKey}`)) {
        this[changeKey] = validate(changes[changeKey], this.constructor.model.props[changeKey])
      }
      this[changeKey] = changes[changeKey]
    })
  }
}

// ------------------------------------
// TypedVal
// ------------------------------------

const TypedVal = class TypedVal {
  constructor (value, validation) {
    validation = validation || this.validation || this.model
    this.value = validate(value, validation)
    this.validation = validation
  }

  get () { return this.value }
  g () { return this.get() }

  set (newVal) {
    this.value = validate(newVal, this.validation)
    return this.value
  }
  s (newVal) { return this.set(newVal) }
};

// ------------------------------------
// exports
// ------------------------------------

(root => {
  const _ = {
    validations: validationsMaster,
    validate,
    type,
    validateFunc,
    typeFunc,
    typeClass,
    TypedClass,
    TypedVal
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
