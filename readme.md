<center>
  <div style="text-align: center">
    <a href="https://hattonpoint.com">
      <img
        src="./assets/validationator-header.png"
        style="width: 500px, display: block; margin: auto;"
      />
    </a>
    <p>Current version: 2.0.3</p>
    <a href='./docs/changelog.md'><p>Change log</p></a>
  </div>
</centergs>

Validationator is a flexible and powerful javascript typing & data validation library. Validationator has four exports:
  * **validations** - an object of validation methods. These are used to power all other functions of the library. They can be extended, added to, and used ad hoc.
  * **validate** - the core of the validationator library. Define a validation model of your data and validate to either return the original value or throw a useful error. Use warn or bool mode to override this behavior.
  * **validateFunc** - define the input and output models of a function much like react PropTypes. Create statically typed functions. Uses the validate core.
  * **type** - a wrapper around the validate core library that allows for an alternative more traditional typed language syntax.

Why use validationator:

* statically type js functions for more robust applications
* it's super small, super fast, and backward compatible
* throw useful errors for faster debugging
* very versatile API
* validate forms with ease
* easily add your own custom validations

Wait, doesn't flow do this already? Yes, flow does allow for static typing, but it does not allow for nested data structures or non-type validation checks. This is also a semi-runtime library where flow is compile-time. I say semi because the library is set to look for a 'production' node environment variable and will to bypass any validation. This behavior can be easily overridden.

The default behavior of validate is to return the original value on success and to throw an error on failure. This can be configured to 'bool' and 'warn' mode as well.

## Getting Started
```js
// ==> npm i -S validationator

// for front end
import { validate, validations, validateFunc, type } from 'validationator'

// or for Node
const { validate, validations, validateFunc, type } = require('validationator')

validate('info@hattonpoint.com', String)
```
## Overview

### validations
A validation is simply a method that takes in a value and an options object, and then throws errors if certain criteria are met. They are very fast, throw useful errors, but do not have any of the options or syntactic sugar added by the validate core.
```js
validations.number(12, {
  decimails: 0,
  max: 20
})
```

### validate
Takes in a value and a validation model. By default returns the original value on success and throws a useful error on failure. There are various options to configure this behavior, add and extend validations, and much more. More API details available below.

```js
// do very simple data type checks
validate('asdf', String)

// add extra options
validate('asdf', {
  String,
  minLen: 2
})

// use various non data type validations
validate('info@hattonpoint.com', 'email')
```
### validateFunc
Syntactic sugar that makes it easier to create statically typed functions. Define an inputModel and outputModel to functions.

```js
const increment = num => (num + 1)
increment.inputModel = Number
increment.outputModel = Number

validateFunc(increment, 3)

// There are various ways to create statically typed
// functions and classes discussed in sections below.
```
### Type
An alternative syntax for the validate core. Define the data type first and options after. Define a secondary data type and validate with same options object (the options object inherits the options of the data type). 

```js
const homepage = 'www.hattonpoint.com'
type(String, homepage)

type(String, homepage, {
  maxLen: 100
})

const x = type

const validatedUrl = x(String, homepage, {
  type: 'url',
  maxLen: 100
})
```

# API Details

## validate.js

```javascript
// do very simple data type checks
validate('asdf', String)

// this is all valid syntax too
validate('asdf', 'string')
validate('asdf', { type: 'string' })
validate('asdf', { type: String })

// add extra options
validate('asdf', {
  String,
  minLen: 2
})

// use various non data type validations
validate('info@hattonpoint.com', 'email')

// validate children of arrays and objects
const hooligans = [ 'Mike', 'Erik', 'Kenny' ]
validate(hooligans, { Array, allChildren: String })

// validate deeply nested data structures
const backPack = {
  brand: 'North Face',
  price: 20,
  contents: [
    'water bottle',
    'jacket'
  ],
  fannyPack: {
    style: -1000,
    contents: 'questionable'
  }
}

const validationModel = {
  Object,
  brand: String,
  price: { Number, max: 50 },
  contents: { Array, allChilden: String },
  fannyPack: {
    Object,
    children: {
      // pass multiple validations in an array for or checks
      style: [{ Number, max: 0 }, String, Object],
      contents: { type: 'is', exactly: 'questionable' }
    }
  }
}

validate(backPack, validationModel)

// you can even validate classes

const Hooligan = class Hooligan {
  constructor (name) {
    this.name = name
    this.stomach = []
    this.mood = 'grumpy'
  }

  eat (food) {
    this.stomach.push(food)
  }

  drink (drank) {
    if (drank === 'coffee') this.mood = 'better'
  }
}

const Ian = new Hooligan('Ian')

validate(Ian, {
  type: 'instance',
  of: Hooligan,
  strict: true,
  children: {
    name: String,
    eat: Function,
    drink: Function
  }
})
```

### Validation Model API

A validation model is an object that describes your value. It can be a simple type check or a complex data evaluation with appended tests.

'type' is the only required validation. Each type will also have its own set of custom validation options. There are many validation types available, many powered by the validator.js library. See the validation type section below for more details.

The default behavior of validate is to return the original value on success and throw an error on failure. This behavior can be changed using the various options outlined below.

By default, all validated values are required and any falsy value will fail the required check. See the acceptedNulls and notRequired options below to change this behavior.

validate and validateFunc both default to bypassing all validation when a 'production' node environment is detected. (ie. process.enc.NODE_ENV === 'production'). This is so typing errors can be found in development but would prevent the performance dip from validation in production. This behavior can be controlled with the ON and OFF options.

### shared options:

Some options are shared by all validation types. They are:
-   **name\<string>** - name to be used in error reporting (optional)
```javascript
validate('hello', { String, name: 'hello-string' })
```
-   **on\<boolean>** - if true the validate function will ignore the check for a production node environment and run anyway. This is an override option to let the validation run in production.
```javascript
process.env.NODE_ENV = 'production'

validate(12, { Number, on: true })
// validates even in production
// off, warn, and bool API just like on.
```
-   **off\<boolean>** - if true turns off all validation. Same as what happens in production environment
-   **warn\<boolean>** - if true errors delivered through console.warn rather than throwing an error. This allows for non-blocking validation.
-   **bool\<boolean>**- if true validate will return true or false to indicate validation rather than throw errors.
-   **notRequired\<boolean>**: all fields with a model are considered required unless this is true.
-   **acceptedNulls\<array>**: by default, every falsey value is considered missing when doing the default required field check. This includes values like false and 0. In many instances, you may consider falsey values such as these valid. Pass all accepted null values in an array to override.
```javascript
// on, off, warn, and bool can all also be
// set at the function level like this:

validate.bool = true

// every instance of validate from this
// point on will have the bool option activated.

validate(0, Number) // ==> false
// (because all values are requred by default and
// all falsy values fail the required check by default)

validate(1, Number) // ==> true

validate(0, { Number, notRequired: true }) // ==> true
validate(undefined, { Number, notRequired: true }) // ==> true

const acceptedNulls = [0]
validate(0, { Number, acceptedNulls }) // ==> true
validate(undefined, { Number, acceptedNulls }) // ==> false
```
-   **extend\<cb[value, validation>** extend is a callback function that gives you access to variables of the current evaluation so you can inject custom rules. See below:
```javascript
validate({ test: 1 },
  { Object,
    extend: value => {
      if (value.test === 1) throw new Error('The value is 1! It is not supposed to be 1!!!')
    },
  }
)
```

### boolean

Just a type check.

```javascript
validate(true, Boolean) // ==> true
validate('asdf', Boolean) // throws error
validate(false, { Boolean, acceptedNulls: [false] }) // ==> false
// (because it is returning the original value on success)

validate(false, {
  Boolean,
  bool: true,
  acceptedNulls: [false]
})
// ==> true

// But really though,
// think about whether or not you need to use validate
typeof false === 'boolean' // ==> true
// same thing, way faster.
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
-   **includes\<any>** - fail validation if object does not include value
-   **notIncludes\<any>** - fail validation if object does include value
-   **includesAny\<any>** - fail validation if object does not include any of the values in an array
-   **notIncludesAny\<[any]>** - fail validation if object does include any of the values in an array
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<object>** - an object with keys that match the expected keys of the value with a valueModel for each key. This allows for deeply nested data structure models.


### array

-   **minLength\<number>**
-   **maxLength\<number>**
-   **requredKeys\<array<string>>**
-   **includes\<any>** - fail validation if array does not include value
-   **notIncludes\<any>** - fail validation if array does include value
-   **includesAny\<any>** - fail validation if array does not include any of the values in an array
-   **notIncludesAny\<[any]>** - fail validation if array does include any of the values in an array
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<array>** - an array of valueModels that corresponds to the expected value in an array. This allows for deeply nested data structure models.

### instance
Check to see if a value is an instance of a constructor. 

-   **of\<Constructor>** - the constructor of the instance you are testing. uses instanceof, so values like 'Object' will still pass
-   **strict\<bool>** - strictly test constructor. Ancestors not included

-   **instance also inherits all of the options of Object, including children!**

```js
const Hooligan = class Hooligan {
  constructor (name) {
    this.name = name
    this.stomach = []
    this.mood = 'grumpy'
  }

  eat (food) {
    this.stomach.push(food)
  }

  drink (drank) {
    if (drank === 'coffee') this.mood = 'better'
  }
}

const Ian = new Hooligan('Ian')

validate(Ian, {
  type: 'instance',
  of: Hooligan,
  strict: true,
  children: {
    name: String,
    eat: Function,
    drink: Function
  }
})
```


### is 
validates that the value is exactly equal to the value specified
```javascript
validate('true', { type: 'is', exactly: 'true' }) // ==> 'true'
validate('true', { type: 'is', exactly: true }) // throw error
```

### string-int
parseInt then number validation

## validator validations
note all of the validations below are powered by the validator package. See the validator docs for more info on the options. Validator options can be provided through the validation object. They should work as expected, but I still need to write tests to verify and need to add better use documentation below. For now, I am just showing an example of the error that will be thrown if validation is not met.

### email
    string: ${value} does not match email validation with options: ${options}
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

validate(11 , [String, { Number, max: 22 }]) // ==> 11
validate('towel' , [String, { Number, max: 22 }]) // ==> 'towel'
validate(89 , [String, { Number, max: 22 }]) // throw error

```

### extensions & only
One of the most valuable features of the validationator is the ability to easily add your own validations. Simply define a new type via validate.extensions and throw errors to validate the value.

To add validations define validate.extensions as an object. Every key you add will be a new available type. The value is a method that takes two parameters: the value that will be passed to it in the validation process, and a validation object. This is exactly the same way the validations under the hood are designed. Below are a few examples of existing types to get you started. Remember! You want to throw errors not return true or false. That is handled by the error catching BOOL option area of the validate function.

validate itself throws errors by default, so feel free to validate itself within the validations.

If you create a valuable validation please visit our [contribution guidelines](./docs/contribution.md) page and consider submitting a pull request :)

```js
const validate = require('validationator').validate

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
const increment = number => (number + 1)

increment.inputModel = Number
increment.outputModel = Number
 
validateFunc(increment, 1) // ==> 2
validateFunc(increment, '1') // throws error
```

Or if you were to build it into the function

```javascript
const increment = number => {
  const innerFunc = number => (number + 1)
  innerFunc.inputModel = { Number, name: 'increment' }
  innerFunc.outputModel = { Number, name: 'increment' }
  return validateFunc(innerFunc, number)
}
 
increment(1) // increment is now a strongly typed function
```

You could also accomplish the same thing using just the validate core library.
```javascript
const increment = number => {
  validate(number, Number)
  const innerFunc = number => (number + 1)
  return validate(innerFunc(number), Number)
}
 
increment(1) // increment is now a strongly typed function
```

or with the new type syntax
```js
import { type as x } from 'validationator'

const increment = number => {
  x(Number, number)
  const innerFunc = number => (number + 1)
  return x(Number, innerFunc(number))
}

```

Note that if your function takes in a single array as its sole argument you will need to double wrap the array so that validateFunc does not think it is for multiple parameters.

```javascript
const ct = arr => arr.length
 
ct.inputModel = { Array }
 
validateFunc(ct, [[ 1, 2, 3 ]])
```

### multiple parameters

```javascript
const multiply = (a, b) => a * b
 
multiply.inputModel = [ Number, Number ]
 
assert(validateFunc(multiply, [2, 3]) === 6)
```

### parameter destructuring

```javascript
const multiply = ({ a, b }) => a * b
 
multiply.inputModel = {
  a: Number,
  b: Number,
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
  { Number, min: 40 },
  { String, maxLength: 1 },
  { Boolean, notRequired: true },
]
 
testFunc.outputModel = {
  Object,
  children: {
    see: String
    coolness: { Number, min: 10000 },
    itSucks: { Boolean, acceptedNulls: [ false ] },
  },
}
 
validateFunc(testFunc, [ 50, 'a', false ])
```
```javascript
// or contained within the function itself
 
const testFunc2 = (num, char, bool) => {
  execution.inputModel = [
      { Number, min: 40 },
      { String, maxLength: 1 },
      { Boolean, notRequired: true },
  ]
 
  const execution = (num, char, bool) => ({
    see: 'it works',
    coolness: 1000000,
    itSucks: false,
  })
 
  execution.outputModel = {
    Object,
    children: {
      see: String,
      coolness: { Number, min: 10000 },
      itSucks: { Boolean, acceptedNulls: [ false ] },
    },
  }
 
  return validateFunc(execution, [num, char, bool])
}
 
testFunc2(50, 'a', false) // now a strongly typed function
```