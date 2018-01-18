const getFuncParamNames = require('./utilities/getFuncParamNames')
const matchesAny = require('./utilities/matchesAny')
const validate = require('./validate')

// options: off, warn, on
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

module.exports = validateFunc
