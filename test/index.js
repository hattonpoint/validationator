// const readline = require('readline')
const assert = require('chai').assert
const validate = require('../src').validate
const validateFunc = require('../src').validateFunc

// describe('SETUP', () => {
//   it('passes setup', next => {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     })

//     rl.question(`
// Please specify and environment:

//   a - src
//   b - dist
//   c - package

// `, res => {
//         if (res.toLowerCase() === 'a') {
//           validate = require('../src').validate
//           validateFunc = require('../src').validateFunc
//         } else if (res.toLowerCase() === 'b') {
//           validate = require('../dist').validate
//           validateFunc = require('../dist').validateFunc
//         } else if (res.toLowerCase() === 'c') {
//           validate = require('validationator').validate
//           validateFunc = require('validationator').validateFunc
//         } else {
//           throw new Error('that did not match any of the options!')
//         }

//         rl.close()
//         next()
//       })
//   }).timeout(30 * 1000)
// })

describe('validate.js tests', () => {
  context('STRING', () => {
    const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    it('type', () => {
      validate('test string', { type: 'string' })
      assert.throws(() => validate('test string', { type: 'array' }))
    })

    it('type shorthand', () => {
      validate('test string', 'string')
      assert.throws(() => validate('test string', 'array'))
    })

    it('maxLength', () => {
      validate('test string', { type: 'string', maxLength: 50 })
      assert.throws(() => validate('test string', { type: 'string', maxLength: 5 }))
    })

    it('minLength', () => {
      validate('test string', { type: 'string', minLength: 5 })
      assert.throws(() => validate('test string', { type: 'string', minLength: 50 }))
    })

    it('regEx', () => {
      validate('sampleEmail@email.com', { type: 'string', regEx: emailRegEx })
      assert.throws(() => validate('sampleEmailemail.com', { type: 'string', regEx: emailRegEx }))
    })

    it('includes', () => {
      validate('this is a test', { type: 'string', includes: 'test' })
      assert.throws(() => validate('this is for real!', { type: 'string', includes: 'test' }))
    })

    it('includesAny', () => {
      validate('I love toast', { type: 'string', includesAny: [ 'test', 'toast' ] })
      assert.throws(() => validate('I love bananas', { type: 'string', includesAny: [ 'test', 'toast' ] }))
    })

    it('notIncludesAny', () => {
      validate('contact is at company because apples', { type: 'string', notIncludesAny: [ 'erin', 'abc corp', 'undefined' ] })
      assert.throws(() => validate('erin is at abc corp because undefined', { type: 'string', notIncludesAny: [ 'erin', 'abc corp', 'undefined' ] }))
    })

    it('notIncludes', () => {
      validate('her name was Mary', { type: 'string', notIncludes: 'undefined' })
      assert.throws(() => validate('her name was undefined', { type: 'string', notIncludes: 'undefined' }))
    })

    it('all', () => {
      validate('testall@email.com', {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        regEx: emailRegEx
      })

      assert.throws(() => {
        validate('testall@emaiom', {
          type: 'string',
          minLength: 3,
          maxLength: 50,
          regEx: emailRegEx
        })
      })
    })

    it('or', () => {
      validate('test@gmail.com', [
        { type: 'string', maxLength: 4 },
        { type: 'string', regEx: emailRegEx }
      ])

      assert.throws(() => {
        validate('testgmail.com', [
          { type: 'string', maxLength: 4 },
          { type: 'string', regEx: emailRegEx }
        ])
      })
    })

    it('notRequired', () => {
      validate(null, { type: 'string', notRequired: true })
      assert.throws(() => validate(null, { type: 'string' }))
    })
  })

  context('NUMBER', () => {
    it('type', () => {
      validate(4, { type: 'number' })
      assert.throws(() => validate('asdf', { type: 'number' }))
    })

    it('min', () => {
      validate(4, { type: 'number', min: 3 })
      assert.throws(() => validate(4, { type: 'number', min: 5 }))
    })

    it('max', () => {
      validate(5, { type: 'number', max: 6 })
      assert.throws(() => validate(7, { type: 'number', max: 6 }))
    })

    it('decimails', () => {
      validate(1.333, { type: 'number', decimals: 3 })
      assert.throws(() => validate(1.123, { type: 'number', decimals: 0 }))
    })

    it('regEx', () => {
      validate(1234, { type: 'number', regEx: /^[0-9]{4,6}$/ })
      assert.throws(() => validate(123, { type: 'number', regEx: /^[0-9]{4,6}$/ }))
    })

    it('acceptedNulls', () => {
      validate(0, { type: 'number', acceptedNulls: [ 0 ] })
      assert.throws(() => validate(0, { type: 'number' }))
    })
  })

  context('FUNCTION', () => {
    it('type', () => {
      validate(() => {}, { type: 'function' })
      assert.throws(() => validate([], { type: 'function' }))
    })
  })

  context('BOOLEAN', () => {
    it('type', () => {
      validate(true, { type: 'boolean' })
      assert.throws(() => validate('asdf', { type: 'boolean' }))
    })
  })

  context('ARRAY', () => {
    it('array', () => {
      validate([], { type: 'array' })
      assert.throws(() => validate({}, { type: 'array' }))
    })

    it('maxLength', () => {
      validate([1, 2, 3], { type: 'array', maxLength: 3 })
      assert.throws(() => validate([1, 2, 3, 4], { type: 'array', maxLength: 3 }))
    })

    it('minLength', () => {
      validate([1, 2, 3], { type: 'array', minLength: 3 })
      assert.throws(() => validate([1], { type: 'array', minLength: 3 }))
    })

    it('includes', () => {
      validate(['test'], { type: 'array', includes: 'test' })
      assert.throws(() => validate(['toast'], { type: 'array', includes: 'test' }))
    })

    it('includesAny', () => {
      validate(['fruit', 'banana', 'ebola'], { type: 'array', includesAny: [ 'ebola', 'bad juju' ] })
      assert.throws(() => validate(['fruit', 'banana'], { type: 'array', includesAny: [ 'ebola', 'bad juju' ] }))
      validate(['fruit', 'banana', { 'ebola': true }], { type: 'array', includesAny: [ { 'ebola': true }, 'bad juju' ] })
      assert.throws(() => validate(['fruit', 'banana'], { type: 'array', includesAny: [ 'ebola', 'bad juju' ] }))
    })

    it('notIncludesAny', () => {
      validate(['fruit', 'banana', 'orange'], { type: 'array', notIncludesAny: [ 'ebola', 'bad juju' ] })
      assert.throws(() => validate(['fruit', 'banana', 'ebola'], { type: 'array', notIncludesAny: [ 'ebola', 'bad juju' ] }))
    })

    it('notIncludes', () => {
      validate(['toast'], { type: 'array', notIncludes: 'test' })
      assert.throws(() => validate(['test'], { type: 'array', notIncludes: 'test' }))
    })

    it('allChildren', () => {
      validate(['asdf', 'asdf'], { type: 'array', allChildren: { type: 'string' } })
      assert.throws(() => validate(['asdf', 2], { type: 'array', allChildren: { type: 'string' } }))
    })

    it('children', () => {
      validate([2, 'asdf'], { type: 'array',
        children: [
          { type: 'number' },
          { type: 'string' }
        ]})
      assert.throws(() => validate([1, 2], { type: 'array',
        children: [
          { type: 'number' },
          { type: 'string' }
        ]}))
    })

    it('extend', () => {
      validate({ test: 0 }, { type: 'object',
        extend: value => {
          if (value.test === 1) throw new Error('The value is 1! It is not supposed to be 1!!!')
        }})

      assert.throws(() => validate({ test: 1 }, { type: 'object',
        extend: value => {
          if (value.test === 1) throw new Error('The value is 1! It is not supposed to be 1!!!')
        }}))
    })
  })

  context('OBJECT', () => {
    it('type', () => {
      validate({}, { type: 'object' })
      assert.throws(() => validate([], { type: 'object' }))
    })

    it('requiredKeys', () => {
      validate({ test: 2 }, { type: 'object', requiredKeys: [ 'test' ] })
      assert.throws(() => validate({ test2: 4 }, { type: 'object', requiredKeys: [ 'test' ] }))
    })

    it('minLength', () => {
      validate({ a: 1, b: 2, c: 3 }, { type: 'object', minLength: 3 })
      assert.throws(() => validate({ a: 1, b: 2 }, { type: 'object', minLength: 3 }))
    })

    it('maxLength', () => {
      validate({ a: 1 }, { type: 'object', maxLength: 1 })
      assert.throws(() => validate({ a: 1, b: 2 }, { type: 'object', maxLength: 1 }))
    })

    it('includes', () => {
      validate({ key: 'test' }, { type: 'object', includes: 'test' })
      assert.throws(() => validate({ key: 'toast' }, { type: 'object', includes: 'test' }))
    })

    it('includes', () => {
      validate({ key: [ 'test' ] }, { type: 'object', includes: ['test'] })
      assert.throws(() => validate({ key: ['toast'] }, { type: 'object', includes: ['test'] }))
    })

    it('notIncludes', () => {
      validate({ toast: 'toast' }, { type: 'object', notIncludes: 'test' })
      assert.throws(() => validate({ test: 'test' }, { type: 'object', notIncludes: 'test' }))
    })

    it('includesAny', () => {
      validate({ a: 'test' }, { type: 'object', includesAny: [ 'test', 'undefined' ] })
      assert.throws(() => validate({ a: 'toast' }, { type: 'object', includesAny: [ 'test', 'undefined' ] }))
    })

    it('notIncludesAny', () => {
      validate({ a: 'toast' }, { type: 'object', notIncludesAny: [ 'test', 'undefined' ] })
      assert.throws(() => validate({ a: 'undefined' }, { type: 'object', notIncludesAny: [ 'test', 'undefined' ] }))
    })

    it('allChildren', () => {
      validate({ key1: 'asdf', key2: 'asdf' }, { type: 'object', allChildren: { type: 'string' } })
      assert.throws(() => validate({ key1: 'asdf', key2: 3 }, { type: 'object', allChildren: { type: 'string' } }))
    })

    it('children', () => {
      validate({ key1: 'a', key2: 2 }, { type: 'object',
        children: {
          key1: { type: 'string' },
          key2: { type: 'number' }
        }
      })
      assert.throws(() => validate({ key1: 'a', key2: '2' }, { type: 'object',
        children: {
          key1: { type: 'string' },
          key2: { type: 'number' }
        }
      }))
    })
  })

  context('EMAIL', () => {
    it('type', () => {
      validate('user@company.com', { type: 'email' })
      assert.throws(() => validate('usercompany.com', { type: 'email' }))
    })
  })

  context('validate.extensions', () => {
    it('should validate the company email', () => {
      validate.extensions = [
        {
          type: 'company-email',
          rules: value => {
            if (!value.includes('company')) throw new Error('that is not a company email')
          }
        }
      ]

      validate('user@company.com', { type: 'company-email' })
      assert.throws(() => validate('user@competitor.com', { type: 'company-email' }))
    })
  })

  context('LARGE DATA STRUCTURE', () => {
    it('min', () => {
      const validation = { type: 'object',
        children: {
          a1: { type: 'string' },
          a2: {
            type: 'object',
            requiredFields: ['b1'],
            allChilden: [ 'object', 'array' ],
            children: {
              b1: {
                type: 'object',
                children: {
                  c1: { type: 'number', min: 5, max: 100, isRequired: true }
                }
              }
            }
          },
          a3: {
            type: 'array',
            children: [
              {
                type: 'object',
                children: {
                  c2: { type: 'boolean' }
                }
              },
              { type: 'string' }
            ]
          }
        }
      }

      const passingValue = {
        a1: 'asdf',
        a2: {
          b1: {
            c1: 88
          }
        },
        a3: [
          {
            c2: true
          },
          'asdf'
        ]
      }

      const failingValue = {
        a1: 'asdf',
        a2: {
          b1: {
            c1: 88
          }
        },
        a3: [
          {
            c2: true
          },
          22
        ]
      }

      validate(passingValue, validation)
      assert.throws(() => validate(failingValue, validation))
    })
  })

  context('OPTIONS', () => {
    it('bool', () => {
      assert(validate('asdf', { type: 'string' }, { bool: true }))
      assert(!validate(33, { type: 'string' }, { bool: true }))

      validate.bool = true
      assert(validate('asdf', { type: 'string' }))
      assert(!validate(33, { type: 'string' }))
      validate.bool = false
    })

    it('off', () => {
      assert(validate(33, { type: 'string' }, { off: true }) === 33)
    })

    it('warn', () => {
      console.log('NOTE: This will print an error to the console while testing. That is expected.')
      assert(validate(33, { type: 'string' }, { warn: true }) === 33)
    })
  })
})

describe('validateFunc.js tests', () => {
  context('validate output only', () => {
    it('should validate the output', () => {
      const testFunc = () => 'asdf'
      testFunc.outputModel = { type: 'string' }
      validateFunc(testFunc)
      testFunc.outputModel = { type: 'number' }
      assert.throws(() => validateFunc(testFunc))
    })

    it('should return the function return value', () => {
      const testFunc = () => 'asdf'
      testFunc.outputModel = { type: 'string' }
      assert(validateFunc(testFunc) === testFunc())
    })
  })

  context('validate input only', () => {
    it('should validate a single func param', () => {
      const increment = number => number + 1
      increment.inputModel = { type: 'number' }
      validateFunc(increment, 1)
      assert.throws(() => validateFunc(increment, 'a'))
    })

    it('should validate a single array param', () => {
      const ct = arr => arr.length
      ct.inputModel = { type: 'array' }
      assert(validateFunc(ct, [[ 1, 2, 3 ]]) === 3)
      assert.throws(() => validateFunc(ct, 'a'))
    })

    it('should validate multiple input params', () => {
      const multiply = (a, b) => a * b
      multiply.inputModel = [
        { type: 'number' },
        { type: 'number' }
      ]
      assert(validateFunc(multiply, [2, 3]) === 6)
      assert.throws(() => validateFunc(multiply, [2, 'a']))
    })

    it('should be able to handle OR validations', () => {
      const multiply = (a, b) => a * b
      multiply.inputModel = [
        { type: 'number' },
        [{ type: 'number' }, { type: 'string' }]
      ]
      validateFunc(multiply, [2, 'a'])
      multiply.inputModel = [
        { type: 'number' },
        { type: 'number' }
      ]
      assert.throws(() => validateFunc(multiply, [2, 'a']))
    })

    it('should validate deconstructed object params', () => {
      const multiply = ({ a, b }) => a * b
      multiply.inputModel = {
        a: { type: 'number' },
        b: { type: 'number' }
      }
      validateFunc(multiply, { a: 1, b: 8 })
      assert.throws(() => validateFunc(multiply, { a: 1, b: '8' }))
    })
  })

  context('Validate both input and output', () => {
    it('should work like a charm', () => {
      const testFunc = (num, char, bool) => {
        return {
          see: 'it works',
          coolness: 1000000,
          itSucks: false
        }
      }

      testFunc.inputModel = [
        { type: 'number', min: 40 },
        { type: 'string', maxLength: 1 },
        { type: 'bool', notRequired: true }
      ]

      testFunc.outputModel = {
        type: 'object',
        children: {
          see: { type: 'string' },
          coolness: { type: 'number', min: 10000 },
          itSucks: { type: 'bool', notRequired: true }
        }
      }

      validateFunc(testFunc, [ 50, 'a', false ])
      assert.throws(() => validateFunc(testFunc, [ 35, 'a', false ]))
    })
  })
})
