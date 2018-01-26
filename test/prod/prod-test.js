const runTests = require('../tests')
const { validate, validateFunc, type } = require('validationator')

runTests(validate, validateFunc, type)
