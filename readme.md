Validationator is a flexible and powerful javascript data validation library. validationator is split into two major functions; validate and validateFunc. validate is the core of the library allowing you to validate simple and complex data structures in various ways by creating a model of the data structure. validateFunc allows you to add an inputModel and/or outputModel to a function to make it statically typed. Validate uses the validator.js library under the hood, so if you are familiar with those validations you should be familiar with much of this library.

Why use validationator:

* statically type js functions for more robust applications
* it's super small, super fast, and backwards compatable
* throw useful errors for faster debugging
* very versitile api
* validate forms with ease

Wait, doesn't flow do this already? Yes, flow does allow for static typing, but it does not allow for nested data structures or non-type validation checks. This is also a semi-runtime library where flow is compile-time. I say semi because the library is set to look for a 'production' node environment variable and will to bypass any validation. 

validate.js
-----------

```javascript
validate(value, validation)
 
// ie.
validate(332.34, {
  type: 'number',
  decimals: 2,
  name: 'test1',
   bool: true
})
 
// or
validate(332.34, { type: 'number' })

// or use the shorthand for type only check
validate(332.34, 'number')

// you can get pretty specific
const value = [ 12, 'hello', false]

validate(value, { type: 'array',
  children: [
    { type: 'number', min: 10 },
    { type: 'is', exactly: 'hello'},
    { type: 'bool', notRequired: true }
  ]
})
 
// you can also do an OR validation by passing an array of validation objects. ie
validate('i am a string', [{ type: 'number' }, { type: 'string' }])
validate(44, ['number', 'string'])

```

### Validation Model API

The validation model is an object that describes your value. It can be a simple type check or a complex data evaluation with appended tests.

'type' is the only required validation. Each type will also have its own set of custom validation options. There are many validation types available, many powered by the validator.js library. See the validation type section below for more details.

The default behavior of validate is to return the original value on success and throw an error on failure. This behavior can be changed using the various options outlined below.

By default, all validated values are required and any falsy value will fail the required check. See the acceptedNulls and notRequired options below to change this behavior.

validate and validateFunc both default to bypassing all validation when a 'production' node environment is detected. (ie. process.enc.NODE_ENV === 'production'). This is so typing errors can be found in development but would prevent the performance dip from validation in production. This behavior can be controlled with the ON and OFF options.

### shared options:

Some options are shared by all validation types. They are:
-   **name\<string>** - name to be used in error reporting (optional)
```javascript
validate('hello', { type: 'string', name: 'hello-string' })
```
-   **on\<boolean>** - if true the validate function will ignore the check for a production node environment and run anyway. This is an override option to let the validation run in production.
```javascript
process.env.NODE_ENV = 'production'

validate(12, { type: 'number', on: true })
// validates even in production
// off, warn, and bool api just like on.
```
-   **off\<boolean>** - if true turns off all validation. Same as what happens in production environment
-   **warn\<boolean>** - if true errors delivered through console.warn rather than throwing an error. This allows for non-blocking validation.
-   **bool\<boolean>**- if true validate will return true or false to indicate validation rather than throw errors.
-   **notRequired\<boolean>**: all fields with a model are considered required unless this is true.
-   **acceptedNulls\<array>**: by default, every falsey value is considered missing when doing the default required field check. This includes values like false and 0. In many instances, you may consider falsey values such as these valid. Pass all accepted null values in an array to override.
```javascript
// on, off, warn, and bool can all also be set at the function level like this:
validate.bool = true
// every instance of validate from this point on will have the bool option activated.

validate(0, 'number') // ==> false (because all values are requred by default and all falsy values fail the required check by default)
validate(1, 'number') // ==> true

validate(0, { type: 'number', notRequired: true }) // ==> true
validate(undefined, { type: 'number', notRequired: true }) // ==> true

const acceptedNulls = [0]
validate(0, { type: 'number', acceptedNulls }) // ==> true
validate(undefined, { type: 'number', acceptedNulls }) // ==> false
```
-   **extend\<cb[value, validation>** extend is a callback function that gives you access to variables of the current evaluation so you can inject custom rules. See below:
```javascript
validate({ test: 1 },
  { type: 'object',
    extend: value => {
      if (value.test === 1) throw new Error('The value is 1! It is not supposed to be 1!!!')
    },
  }
)
```

### boolean

Just a type check.

```javascript
validate(true, 'bool') // ==> true
validate('asdf', 'bool') // throws error
validate(false, { type: 'bool', acceptedNulls: [0] }) // ==> false
```

Remember to add false to the acceptedNulls list if you want them not to fail this validation

### function

Just a type check.

```javascript
const increment = int => (int + 1)

validate(increment, 'function') // ==> increment
```

### string

-   **maxLength\<number>**
-   **minLength\<number>**
-   **regEx\<regEx>** - tests the string against a provided regEx expression
-   **includes\<string>** - fail validation if string does not include string
-   **notIncludes\<string>** - fail validation if string does include string
-   **includesAny\<string>** - fail validation if string does not include any of the strings in an array
-   **notIncludesAny\<[string]>** - fail validation if string does include any of the strings in an array
-   **upperCase\<bool>** - fail validation if string is not all uppercase
-   **lowerCase\<bool>** - fail validation if string is not all lowercase

### number

-   **max\<number>**
-   **min\<number>**
-   **decimals\<number>** - specifies the maximum amount of decimals. Less than the number provided will pass.
-   **regEx\<regEx>** - tests the string against a provided regEx expression

### object

-   **minLength\<number>**
-   **maxLength\<number>**
-   **requredKeys\<array<string>>**
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<object>** - an object with keys that match the expected keys of the value with a valueModel for each key. This allows for deeply nested data structure models.
-   **includes\<any>** - fail validation if object does not include value
-   **notIncludes\<any>** - fail validation if object does include value
-   **includesAny\<any>** - fail validation if object does not include any of the values in an array
-   **notIncludesAny\<[any]>** - fail validation if object does include any of the values in an array


### array

-   **minLength\<number>**
-   **maxLength\<number>**
-   **requredKeys\<array<string>>**
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<array>** - an array of valueModels that corresponds to the expected value in an array. This allows for deeply nested data structure models.
-   **includes\<any>** - fail validation if array does not include value
-   **notIncludes\<any>** - fail validation if array does include value
-   **includesAny\<any>** - fail validation if array does not include any of the values in an array
-   **notIncludesAny\<[any]>** - fail validation if array does include any of the values in an array

## validator validations
note all of the validations below are powered by the validator package. See the validator docs for more info on the options. Validator options can be provided through the validation object. They should work as expected, but I still need to write tests to verify and need to add better use documentation below. For now, I am just showing an example of the error that will be thrown if validation is not met.

### email
    string: ${value} does not match email validation with options: ${options}
### is 
    validates that the value is exactly equal to the value specified
```javascript
validate('true', { type: 'is', exactly: 'true' }) // ==> 'true'
validate('true', { type: 'is', exactly: true }) // throw error
```
### string-int
    parseInt then number validation
### postal-code 
    value: ${value} is not a valid postal code ${state ? ` for state ${state}` : ''}
### url 
    URL ${value} did not match the validation: ${options}
### date 
    value: ${value} is not a valid date
### date-obj 
    value: ${value} is not a valid date object
### phone 
### alpha 
    string: ${value} is not alpha.
### alpha-numeric 
    value: ${value} is not alpha numeric.
### ascii 
    string: ${value} is not an ascii string.
### base64 
    string: ${value} is not a base64 string.
### credit-card 
    value: ${value} is not a valid credit card number.
### currency 
    value: ${value} is not a valid currency with options: ${options}.
### data-uri 
    value: ${value} is not a valid data URI.
### fqdn 
    value: ${value} is not a valid fully qualified domain name.
### float 
    value: ${value} is not a valid float.
### hash 
    value: ${value} is not a valid ${algorithm} hash.
### hex-color 
    value: ${value} is not a valid hex color.
### hex-dec 
    value: ${value} is not a valid hexadecimal.
### ip 
    value: ${value} is not a valid IP v. ${version}.
### isbn 
    value: ${value} is not a valid ISBN v. ${version}.
### issn 
    value: ${value} is not a valid ISSN with options ${options}.
### isin 
    value: ${value} is not a valid ISIN (stock/security identifier).
### iso8601 
    value: ${value} is not a valid ISO8601.
### isrc 
    value: ${value} is not a valid ISRC.
### int 
    value: ${value} is not a valid int with options: ${options}.
### json 
    value: ${value} is not a valid JSON.
### lat-long 
    value: ${value} is not a valid lat-long.
### mac 
    value: ${value} is not a valid MAC address.
### md5 
    value: ${value} is not a valid MD5 hash.
### mime-type 
    value: ${value} is not a valid mime type.
### mongo-id 
    value: ${value} is not a valid mongo-id.
### port 
    value: ${value} is not a valid port number.
### uuid 
    value: ${value} is not a valid UUID.

### or

```javascript
// pass in an array of validation objects instead of a single object to do an or validation

validate(11 , ['string', { type: 'number', max: 22 }]) // ==> 11
validate('towel' , ['string', { type: 'number', max: 22 }]) // ==> 'towel'
validate(89 , ['string', { type: 'number', max: 22 }]) // throw error

```

### extensions & only
One of the most valuable features of the validationator is the ability to easily add your own validations. Simply define a new type via validate.extensions and throw errors to validate the value.

To add validations define validate.extensions as an object. Every key you add will be a new available type. The value is a method that takes two parameters: the value that will be passed to it in the validation process, and a validation object. This is exactly the same way the validations under the hood are designed. Below are a few examples of existing types to get you started. Remember! You want to throw errors not return true or false. That is handled by the error catching BOOL option area of the validate function.

validate itself throws errors by default, so feel free to validate itself within the validations.

If you create a valuable validation please visit our contribution guidelines page and consider submitting a pull request :)

```js
const validate = require('validationator').validate
// or
const { validate } = require('validationator')
// or
import { validate } from 'validationator'

validate.extensions = {
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
}
```
```javascript
// only is like extensions except that it allows you to specifically pick the only validations you want to include in the validate call. You also have access to the default validations object.

// this is here as a performance optimization, but honestly, it is just cutting out a few dozen ops.

import { validate, validations } from 'validationator'

validate.only = {
  'number': validations.number,
  'postal-code': (value, { state }) => {
    validate(value, ['string', 'number'])
    state = state || 'any'
    value = `${value}` // convert to string if not number
    if (!validator.isPostalCode(value, state)) throw new Error(`value: ${value} is not a valid postal code ${state ? ` for state ${state}` : ''}`)
  },
}

// number and postal-code are now the only validations available
// you can also use single validations on their own to throw errors

validations.number(12, { max: 10 }) // throws error

// note that bool warn and passthrough options are not available when used this way
```

### Deeply Nested Data Structures

The children options of the array and object types allow us to define large deeply nested models for our data if need be. There is no limit to how deep a model can go. Here is an example of what is possible. 

```javascript
const dataStructure = {
  a1: 'asdf',
  a2: {
    b1: {
      c1: 88,
    },
  },
  a3: [
    {
      c2: true,
    },
    'asdf',
  ],
}
 
const validation = { type: 'object',
  children: {
    a1: 'string',
    a2: {
      type: 'object',
      requiredFields: ['b1'],
      allChilden: ['object', 'array'], // a shorthand OR check
      children: {
        b1: {
          type: 'object',
          children: {
            c1: {
              type: 'number',
              min: 5,
              max: 100,
              notRequired: true
            },
          },
        },
      },
    },
    a3: {
      type: 'array',
      children: [
        {
          type: 'object',
          children: {
            c2: 'boolean',
          },
        },
        'string',
      ],
    },
  },
}
 
validate(passingValue, validation)
```

validateFunc
------------

using the validate core validateFunc serves as an advanced runtime static type checker and validator. Usage of validateFunc differs slightly depending on the way you structure your parameters. You define the models by adding an inputModel or/and outputModel param to your function. Both inputModel and outputModel are optional, but both cannot be missing or you should not be using the function. You must pass your function then your parameters into validateFunc, or you can build it into your function definitions. validateFunc will return the return value of the product.

```javascript
validateFunc(func, param(s), options)
```

### options (optional)

The options object can take the following parameters:

-   **on\<boolean>** - if true the validate function will ignore the check for a production node environment and run anyway. This is an override option to let the validation run in production.
-   **off\<boolean>** - if true turns off all validation. Same as what happens in production environment
-   **warn\<boolean>** - if true errors delivered through console.warn rather than throwing an error. This allows for non-blocking validation.

### single parameter

```javascript
const increment = number => number + 1
 
increment.inputModel = { type: 'number' }
// or
increment.inputModel = 'number'
 
increment.outputModel = { type: 'number' }
 
validateFunc(increment, 1)
```

Or if you were to build it into the function

```javascript
const increment = number => {
  increment.inputModel = 'number'

  const innerFunc = number => number + 1

  increment.outputModel = 'number'
  return validateFunc(innerFunc, number)
}
 
increment(1) // increment is now a strongly typed function
```

You could also accomplish the same thing using just the validate core library.
```javascript
const increment = number => {
  number = validate(number, 'number')

  const innerFunc = number => number + 1

  return validate(innerFunc(number), {
    type: 'number',
    name: 'increment return' // for better error reporting. Could put this on the input too.
  })
}
 
increment(1) // increment is now a strongly typed function
```

Note that if your function takes in a single array as its sole argument you will need to double wrap the array so that validateFunc does not think it is for multiple parameters.

```javascript
const ct = arr => arr.length
 
ct.inputModel = { type: 'array' }
 
validateFunc(ct, [[ 1, 2, 3 ]])
```

### multiple parameters

```javascript
const multiply = (a, b) => a * b
 
multiply.inputModel = [
  { type: 'number' },
  { type: 'number' },
]
 
assert(validateFunc(multiply, [2, 3]) === 6)
```

### parameter destructuring

```javascript
const multiply = ({ a, b }) => a * b
 
multiply.inputModel = {
  a: { type: 'number' },
  b: { type: 'number' },
}
 
validateFunc(multiply, { a: 1, b: 8 })
```

**it just works**

```javascript
// do below the function like react proptypes

const testFunc = (num, char, bool) => {
  return {
    see: 'it works',
    coolness: 1000000,
    itSucks: false,
  }
}
 
testFunc.inputModel = [
  { type: 'number', min: 40 },
  { type: 'string', maxLength: 1 },
  { type: 'bool', notRequired: true },
]
 
testFunc.outputModel = {
  type: 'object',
  children: {
    see: { type: 'string' },
    coolness: { type: 'number', min: 10000 },
    itSucks: { type: 'bool', acceptedNulls: [ false ] },
  },
}
 
validateFunc(testFunc, [ 50, 'a', false ])
```
```javascript
// or contained within the function itself
 
const testFunc2 = (num, char, bool) => {
  execution.inputModel = [
      { type: 'number', min: 40 },
      { type: 'string', maxLength: 1 },
      { type: 'bool', notRequired: true },
  ]
 
  const execution = (num, char, bool) => ({
    see: 'it works',
    coolness: 1000000,
    itSucks: false,
  })
 
  execution.outputModel = {
    type: 'object',
    children: {
      see: { type: 'string' },
      coolness: { type: 'number', min: 10000 },
      itSucks: { type: 'bool', acceptedNulls: [ false ] },
    },
  }
 
  return validateFunc(execution, [num, char, bool])
}
 
testFunc2(50, 'a', false) // now a strongly typed function
```
