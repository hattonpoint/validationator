const matchesAny = require('./utilities/matchesAny')

// options: off, warn, bool, on
const validate = (value, validation, options = {}) => {
  try {
    if ((process.env.NODE_ENV === 'production' || options.off) && (!options.on || !options.bool)) return
    const name = options.name || ''
    if (Array.isArray(validation)) {
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
    } else {
      const isAcceptedNull = value => {
        let returnVal = false
        if (validation.acceptedNulls) {
          validation.acceptedNulls.forEach(nullVal => {
            if (nullVal === value) returnVal = true
          })
        }
        return returnVal
      }

      if (!value && !isAcceptedNull(value)) {
        if (validation.notRequired) {
          if (options.bool) return true
          else return
        } else {
          if (options.bool) return false
          else throw new Error(`Argument '${name}' is required!`)
        }
      }

      if (typeof validation === 'string') validation = { type: validation }
      if (!validation.type) throw new Error(`${name}.type is required`)
      if (validation.extend) validation.extend(value, validation, name, options)

      switch (validation.type.toLowerCase()) {
        case 'function': {
          if (typeof value !== 'function') throw new Error(`Expected ${name} to be type function. Got ${typeof value}`)
        } break

        case 'object': {
          const { requiredKeys, children, minLength, maxLength, allChildren } = validation
          const valueKeys = Object.keys(value)
          if (typeof value !== 'object' || Array.isArray(value)) throw new Error(`Expected ${name} to be type object. Got ${typeof value} Array.isArray? ${Array.isArray(value)}`)
          if (requiredKeys) {
            requiredKeys.forEach(requiredKey => {
              if (!valueKeys.find(valueKey => valueKey === requiredKey)) throw new Error(`Missing required key: ${requiredKey}`)
            })
          }
          if (typeof minLength === 'undefined' ? false : valueKeys.length < minLength) throw new Error(`Object length is less than minimum`)
          if (typeof maxLength === 'undefined' ? false : valueKeys.length > maxLength) throw new Error(`Object length is more than maximum`)
          if (allChildren) valueKeys.forEach(valueKey => validate(value[valueKey], allChildren, { name: valueKey }))
          if (children) {
            if (typeof children !== 'object' || Array.isArray(children)) throw new Error(`Expected ${name} validation children to be type object. Got ${typeof value} Array.isArray? ${Array.isArray(value)}`)
            const modelKeys = Object.keys(children)
            if (modelKeys.length !== valueKeys.length) throw new Error(`keys and validation model for ${name} are out of sync. Did you mean to use allChildren? There are ${modelKeys.length} entries to the inputModel and ${valueKeys.length} paramerters.`)

            valueKeys.forEach(valueKey => {
              if (!matchesAny(valueKey, modelKeys)) throw new Error(`The valueKey '${valueKey}' has not been included ${name} children`)
            })

            modelKeys.forEach(modelKey => {
              validate(value[modelKey], children[modelKey], modelKey)
            })
          }
        } break

        case 'array': {
          const { maxLength, minLength, allChildren, children } = validation
          if (!Array.isArray(value)) throw new Error(`Expected ${name} to be type array. Got ${typeof value}`)
          if (typeof minLength === 'undefined' ? false : value.length < minLength) throw new Error(`Array length is less than minimum`)
          if (typeof maxLength === 'undefined' ? false : value.length > maxLength) throw new Error(`Array length is more than maximum`)
          if (allChildren) value.forEach((item, i) => validate(value[i], allChildren, { name: i }))
          if (children) {
            if (children.length !== value.length) throw new Error(`validation and array for ${name} are out of sync.`)
            if (!Array.isArray(children)) throw new Error(`${name}.children must be an array.`)
            children.forEach((model, i) => {
              validate(value[i], model, { name: i })
            })
          }
        } break

        case 'string': {
          const { maxLength, minLength, regEx } = validation
          if (typeof value !== 'string') throw new Error(`Expected ${name} to be type string. Got ${typeof value}`)
          if (typeof minLength === 'undefined' ? false : value.length < minLength) throw new Error(`String length is less than minimum`)
          if (typeof maxLength === 'undefined' ? false : value.length > maxLength) throw new Error(`String length is more than maximum`)
          if (typeof regEx === 'undefined' ? false : !regEx.test(value)) throw new Error(`String does not match the validation regEx.`)
        } break

        case 'number': {
          const { max, min, decimals, regEx } = validation
          if (typeof value !== 'number') throw new Error(`Expected ${name} to be type number. Got ${typeof value}`)
          if (typeof min === 'undefined' ? false : value < min) throw new Error(`Number is less than minimum`)
          if (typeof max === 'undefined' ? false : value > max) throw new Error(`Number is more than maximum`)
          if (typeof decimals === 'undefined' ? false : (() => {
            const stringArr = value.toString().split('.')
            if (stringArr[1]) {
              return stringArr[1].length > decimals
            }
          })()) throw new Error(`Number: ${value} has more than ${decimals} decimails.`)
          if (typeof regEx === 'undefined' ? false : !regEx.test(value)) throw new Error(`String does not match the validation regEx.`)
        } break

        case 'boolean': {
          if (typeof value !== 'boolean') throw new Error(`Expected ${name} to be type boolean. Got ${typeof value}`)
        } break

        case 'email': {
          validate(value, {
            type: 'string',
            maxLength: 50,
            regEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          }, { name })
        } break

        default: {
          throw new Error(`unkown validation type: ${validation.type}`)
        }
      }
      if (options.bool) return true
    }
  } catch (err) {
    if (options.warn) {
      console.warn(err)
    } else if (options.bool) {
      return false
    } else {
      throw err
    }
  }
}

module.exports = validate
