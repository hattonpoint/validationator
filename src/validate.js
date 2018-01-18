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
      validationOptions.push(option.type)
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

      let validations = require('./validations')
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

// exports must be listed above validations require to avoid circular reference bug
module.exports = validate
