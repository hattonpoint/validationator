TODO:
- Add various differnt validation types
- Conduct browser testing
- Options to recreate password validation. Use at least once etc
- Add options for checking different case styles
- Conduct performance tests
- Debug es2015 preset not transpling foreach into for loops
- Example use with bootstrap
- Example using validation on frontend and node
- Finish NPM pipeline
- Documentation
  - validate.extensions
  - function level options
  - return value
  - more examples
  - class validation
  - use with react
  - use in testing

WARNING: This is a brand new package that probably still has some bugs. Features and the api may change on our way to v2.

validationator is a flexible and powerful javascript data validation library. validationator is split into two major functions; validate and validateFunc. validate is the core of the library allowing you to validate simple and complex data structures in various ways by creating a model of the data structure. validateFunc allows you to add an inputModel and/or outputModel to a function to make it statically typed.

Wait, doesn't flow do this already? Yes, flow does allow for static typing, but it does not allow for nested dataStructures or non-type validation checks. This is also a semi-runtime library where flow is compile-time. I say semi because the library is set to look for a 'production' node environment variable and will to bypass any validation. 


validate.js
-----------

```javascript
validate(value, validation, options)
 
// ie.
validate(332.34, { type: 'number', decimals: 2 }, { name: 'test1' bool: true })
 
// or
validate(332.34, { type: 'number' })

// or use the shorthand for type only check
validate(332.34, 'number')
 
// you can also do an OR validation by passing an array of validation objects. ie
validate('i am a string', [{ type: 'number' }, { type: 'string' }])
```

**value\<any>** - the value you would like to validate

**validation\<validationModel>** - the validation model for the value

**options\<object>-** - options object (optional)

### Validation Model API

The validation model is an object that describes your value. It can be a simple type check, or a complex data evaluation with appended tests.

'type' is the only required validation. Each type will also have it's own set of custom validation options. The fundamental validation types and their options are included and outlined below. It is easy to add custom validation types by recursivly calling the validate function. Check out the email implementation:

### validation options

The options object can take the following parameters:

-   **name\<string>** - name to be used in error reporting (optional)
-   **on\<boolean>** - if true the validate function will ignore the check for a production node environment and run anyway. This is an override option to let the validation run in production.
-   **off\<boolean>** - if true turns off all validation. Same as what happens in production environment
-   **warn\<boolean>** - if true errors delivered through console.warn rather than throwing error. This allows for non-blocking validation.
-   **bool\<boolean>**- if true validate will return true or false to indicate validation rather than throw errors.

Built-in validation types
-------------------------

### shared options:

Some options are shared by all validation types. They are:

-   **notRequired\<boolean>**: all fields with a model are considered required unless this is true.
-   **acceptedNulls\<array>**:by default every falsey value is considered missing when doing the default required field check. This includes values like false and 0. In many instances you may consider falsey values such as these valid. Pass all accepted null values in an array to override.
-   **extend\<cb[value, validation, options]>** extend is a callback function that gives you access to variables of the current evaluation so you can inject custom rules. See below:

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

* Remember to add false to the acceptedNulls list if you want them not to fail this validation

### function

Just a type check.

### string

-   **maxLength\<number>**
-   **minLength\<number>**
-   **regEx\<regEx>** - tests the string against a provided regEx expression

### number

-   **max\<number>**
-   **min\<number>**
-   **decimals\<number>** - specifies the maximum amount of decimals. Less than the number provided will pass.
-   **regEx\<regEx>** - tests the string against a provided regEx expression

### object

-   **minLength\<number>**
-   **maxLength\<number>**
-   **requredKeys\<array<string>>**
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<object>** - an object with keys that match the expected keys of the value with a valueModel for each key. This allows for deeply nested data structure models.

### array

-   **minLength\<number>**
-   **maxLength\<number>**
-   **requredKeys\<array<string>>**
-   **allChildren\<validationModel>** - validates every child against the given validation model
-   **children\<array>** - an array of valueModels that corresponds to the expected value in an array. This allows for deeply nested data structure models.

### email

Performs a regEx check under the hood.

### Deeply Nested Data Structures

The children options of the array and object types allows us to define large deeply nested models for our data if need be. There is no limit to how deep a model can go. Here is an example of what is possible. 

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
    a1: { type: 'string' },
    a2: {
      type: 'object',
      requiredFields: ['b1'],
      allChilden: ['object', 'array'], // a shorthand OR check
      children: {
        b1: {
          type: 'object',
          children: {
            c1: { type: 'number', min: 5, max: 100, notRequired: true },
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
            c2: { type: 'boolean' },
          },
        },
        { type: 'string' },
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

-   **on\<boolean>** - if true the validate function will ignore the check for a production node environment and run anyway. This is an override option to let the validation run in production.
-   **off\<boolean>** - if true turns off all validation. Same as what happens in production environment
-   **warn\<boolean>** - if true errors delivered through console.warn rather than throwing error. This allows for non-blocking validation.

### single parameter

```javascript
const increment = number => number + 1
 
increment.inputModel = { type: 'number' }
 
increment.outputModel = { type: 'number' }
 
validateFunc(increment, 1)
```

Or if you were to build it into the function

```javascript
const increment = number => {
    increment.inputModel = { type: 'number' }
    const innerFunc = number => number + 1
    increment.outputModel = { type: 'number' }
    return validateFunc(innerFunc, number)
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