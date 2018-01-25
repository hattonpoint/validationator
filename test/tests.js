const assert = require('chai').assert

module.exports = (validate, validateFunc) => {
  describe('validate.js tests', () => {
    context('STRING', () => {
      const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      it('type', () => {
        validate('test string', { type: 'string' })
        assert.throws(() => validate('test string', { type: 'array' }))
      })

      it('type primative', () => {
        validate('test string', String)
        assert.throws(() => validate('test string', Array))
      })

      it('type shorthand', () => {
        validate('test string', 'string')
        assert.throws(() => validate('test string', 'array'))
      })

      it('maxLen', () => {
        validate('test string', { type: 'string', maxLen: 50 })
        assert.throws(() => validate('test string', { type: 'string', maxLen: 5 }))
      })

      it('minLen', () => {
        validate('test string', { type: 'string', minLen: 5 })
        assert.throws(() => validate('test string', { type: 'string', minLen: 50 }))
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

      let upperCase

      it('upperCase', () => {
        validate('ASDF', { type: 'string', upperCase })
        assert.throws(() => validate('adsf', { type: 'string', upperCase }))
      })

      it('all', () => {
        validate('testall@email.com', {
          type: 'string',
          minLen: 3,
          maxLen: 50,
          regEx: emailRegEx
        })

        assert.throws(() => {
          validate('testall@emaiom', {
            type: 'string',
            minLen: 3,
            maxLen: 50,
            regEx: emailRegEx
          })
        })
      })

      it('or', () => {
        validate('test@gmail.com', [
          { String, maxLen: 4 },
          { String, regEx: emailRegEx }
        ])

        assert.throws(() => {
          validate('testgmail.com', [
            { type: 'string', maxLen: 4 },
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
        validate(4, 'number')
        assert.throws(() => validate('asdf', 'number'))
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
        assert.throws(() => validate(0, 'number'))
      })
    })

    context('FUNCTION', () => {
      it('type', () => {
        validate(() => {}, 'function')
        assert.throws(() => validate([], 'function'))
      })
    })

    context('BOOLEAN', () => {
      it('type', () => {
        validate(true, 'boolean')
        assert.throws(() => validate('asdf', 'boolean'))
      })
    })

    context('ARRAY', () => {
      it('array', () => {
        validate([], 'array')
        assert.throws(() => validate({}, 'array'))
      })

      it('maxLen', () => {
        validate([1, 2, 3], { type: 'array', maxLen: 3 })
        assert.throws(() => validate([1, 2, 3, 4], { type: 'array', maxLen: 3 }))
      })

      it('minLen', () => {
        validate([1, 2, 3], { type: 'array', minLen: 3 })
        assert.throws(() => validate([1], { type: 'array', minLen: 3 }))
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
            'number',
            'string'
          ]})
        assert.throws(() => validate([1, 2], { type: 'array',
          children: [
            'number',
            'string'
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
        validate({}, 'object')
        assert.throws(() => validate([], 'object'))
      })

      it('requiredKeys', () => {
        validate({ test: 2 }, { type: 'object', requiredKeys: [ 'test' ] })
        assert.throws(() => validate({ test2: 4 }, { type: 'object', requiredKeys: [ 'test' ] }))
      })

      it('minLen', () => {
        validate({ a: 1, b: 2, c: 3 }, { type: 'object', minLen: 3 })
        assert.throws(() => validate({ a: 1, b: 2 }, { type: 'object', minLen: 3 }))
      })

      it('maxLen', () => {
        validate({ a: 1 }, { Object, maxLen: 1 })
        assert.throws(() => validate({ a: 1, b: 2 }, { type: 'object', maxLen: 1 }))
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
            key2: 'number'
          }
        })
        assert.throws(() => validate({ key1: 'a', key2: '2' }, { type: 'object',
          children: {
            key1: { type: 'string' },
            key2: 'number'
          }
        }))
      })
    })

    context('EMAIL', () => {
      it('type', () => {
        validate('user@company.com', 'email')
        assert.throws(() => validate('usercompany.com', 'email'))
      })
    })

    context('ALPHA', () => {
      validate('asdf', 'alpha')
      assert.throws(() => validate('dd%%', 'alpha'))
    })

    context('validate.extensions', () => {
      it('should validate the company email', () => {
        validate.extensions = {
          'company-email': value => {
            if (!value.includes('company')) throw new Error('that is not a company email')
          }
        }

        validate('user@company.com', 'company-email')
        assert.throws(() => validate('user@competitor.com', 'company-email'))
      })
    })

    context('LARGE DATA STRUCTURE', () => {
      it('min', () => {
        const validation = { Object,
          children: {
            a1: String,
            a2: { Object,
              requiredFields: ['b1'],
              allChilden: [ Object, Array ],
              children: {
                b1: {
                  type: Object,
                  children: {
                    c1: { Number, min: 5, max: 100, isRequired: true }
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
                    c2: 'boolean'
                  }
                },
                'string'
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
        assert(validate('asdf', {
          type: 'string',
          bool: true
        }))
        assert(!validate(33, {
          type: 'string',
          bool: true
        }))

        validate.bool = true
        assert(validate('asdf', 'string'))
        assert(!validate(33, 'string'))
        validate.bool = false
      })

      it('off', () => {
        assert(validate(33, { type: 'string', off: true }) === 33)
      })

      it('warn', () => {
        console.log('NOTE: This will print an error to the console while testing. That is expected.')
        assert(validate(33, { type: 'string', warn: true }) === 33)
      })
    })
  })

  describe('validateFunc.js tests', () => {
    context('validate output only', () => {
      it('should validate the output', () => {
        const testFunc = () => 'asdf'
        testFunc.outputModel = 'string'
        validateFunc(testFunc)
        testFunc.outputModel = 'number'
        assert.throws(() => validateFunc(testFunc))
      })

      it('should return the function return value', () => {
        const testFunc = () => 'asdf'
        testFunc.outputModel = 'string'
        assert(validateFunc(testFunc) === testFunc())
      })
    })

    context('validate input only', () => {
      it('should validate a single func param', () => {
        const increment = number => number + 1
        increment.inputModel = 'number'
        validateFunc(increment, 1)
        assert.throws(() => validateFunc(increment, 'a'))
      })

      it('should validate a single array param', () => {
        const ct = arr => arr.length
        ct.inputModel = 'array'
        assert(validateFunc(ct, [[ 1, 2, 3 ]]) === 3)
        assert.throws(() => validateFunc(ct, 'a'))
      })

      it('should validate multiple input params', () => {
        const multiply = (a, b) => a * b
        multiply.inputModel = [ 'number', 'number' ]
        assert(validateFunc(multiply, [2, 3]) === 6)
        assert.throws(() => validateFunc(multiply, [2, 'a']))
      })

      it('should be able to handle OR validations', () => {
        const multiply = (a, b) => a * b
        multiply.inputModel = [
          'number',
          [ 'number', 'string' ]
        ]
        validateFunc(multiply, [2, 'a'])
        multiply.inputModel = [
          'number',
          'number'
        ]
        assert.throws(() => validateFunc(multiply, [2, 'a']))
      })

      it('should validate deconstructed object params', () => {
        const multiply = ({ a, b }) => a * b
        multiply.inputModel = {
          a: 'number',
          b: 'number'
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
          { Number, min: 40 },
          { String, maxLen: 1 },
          { Boolean, notRequired: true }
        ]

        testFunc.outputModel = {
          Object,
          children: {
            see: String,
            coolness: { Number, min: 10000 },
            itSucks: { Boolean, notRequired: true }
          }
        }

        validateFunc(testFunc, [ 50, 'a', false ])
        assert.throws(() => validateFunc(testFunc, [ 35, 'a', false ]))
      })
    })
  })

  describe('fuelsy tests', () => {
    it('should validate the leads even after deploying to npm', () => {
      const leadValidationModel = (lead, bool) => ({ Object,
        bool,
        notIncludes: 'undefined',
        requiredKeys: [ 'ContactPosition', 'LeadTitle', 'LeadIndustries',
          'LeadKeywords', 'Price', 'ContactPhone', 'CompanyName', 'CompanyPostalCode',
          'CompanyStateProvince', 'ContactFirstName', 'ContactLastName', 'Description',
          'IntentToPurchase' ],
        children: {
          Description: {
            type: 'string',
            notIncludesAny: [ lead.CompanyName, lead.ContactFirstName, lead.ContactLastName ]
          },
          IntentToPurchase: {
            type: 'string',
            includes: true
          },
          LeadIndustries: 'string',
          LeadKeywords: 'string',
          Price: {
            type: 'string-int',
            min: 20,
            max: 500
          },
          ContactFirstName: 'string',
          ContactLastName: 'string',
          ContactPosition: 'string',
          LeadTitle: 'string',
          CompanyPostalCode: {
            type: 'postal-code'
          },
          CompanyStateProvince: {
            type: 'string',
            maxLength: 2,
            minLength: 2
          },
          CompanyCountry: {
            type: 'string',
            includes: 'United States'
          },
          CompanyRevenue: {
            type: 'string-int',
            notRequired: true,
            min: 10000,
            max: 1000000000000 // one trillion dollars. Amazon might break this.
          },
          EstimatedOpportunityValue: {
            type: 'string-int',
            notRequired: true,
            max: 100000000
          },
          ContactEmail: {
            type: 'email',
            notRequired: true
          },
          CompanyUrl: {
            type: 'url',
            notRequired: true
          },
          ContactPhone: {
            type: 'phone'
          },
          LeadTiming: {
            type: 'date',
            notRequired: true
          }
        }
      })

      // three leads first passes, second fails, third passes
      const leads = require('./resources/leads')

      validate(leads[0], leadValidationModel(leads[0]))

      assert.throws(() => {
        leads.forEach(lead => {
          validate(lead, leadValidationModel(lead))
        })
      })

      assert(validate(leads[0], leadValidationModel(leads[0], 'bool')) === true)
      assert(validate(leads[1], leadValidationModel(leads[1], 'bool')) === false)
    })
  })
}
