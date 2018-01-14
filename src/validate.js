const validate = (value, validation, options = {}) => {
  const name = options.name || ''
  const ON = (options.on || validate.on)
  const OFF = (options.off || validate.off)
  const WARN = (options.warn || validate.warn)
  const BOOL = (options.bool || validate.bool)

  const shouldBypassValidation = () => (process.env.NODE_ENV === 'production' || OFF) && (!ON || !BOOL)

  const runOrValidation = name => {
    let failedCount = 0
    let validationOptions = []
    validation.forEach(option => {
      validationOptions.push(option.type)
      try {
        validate(value, option, { name })
      } catch (err) {
        failedCount++
      }
    })
    if (failedCount === validationOptions.length) throw new Error(`${name} did not match any of the types: ${validationOptions.toString()}`)
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
    if (shouldBypassValidation()) return
    if (Array.isArray(validation)) { runOrValidation(name) } else {
      // Check for missing value and run required checks
      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (BOOL) return true
          else return
        } else {
          if (BOOL) return false
          else throw new Error(`Argument '${name}' is required!`)
        }
      }

      // Enable shorthand type
      if (typeof validation === 'string') validation = { type: validation }
      if (!validation.type) throw new Error(`${name}.type is required`)
      if (validation.extend) validation.extend(value, validation, name, options)

      let validations = require('./validations')
      if (validate.extensions) validations = [ ...validations, ...validate.extensions ]

      for (let i = 0; i < validations.length; i++) {
        const currentValidation = validations[i]
        if (validation.type.toLowerCase() === currentValidation.type) {
          currentValidation.rules(value, validation, name)
          break
        }
      }

      if (BOOL) return true
    }
  } catch (err) {
    if (WARN) {
      console.warn(err)
    } else if (BOOL) {
      return false
    } else {
      throw err
    }
  }
}

module.exports = validate
