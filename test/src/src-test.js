const runTests = require('../tests')
const { validate, validateFunc, type } = require('../../src')

runTests(validate, validateFunc, type)
