const runTests = require('../tests')
const { validate, validateFunc, type, typeClass } = require('../../src')

runTests(validate, validateFunc, type, typeClass)
