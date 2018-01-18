const runTests = require('../tests')
const validate = require('validationator').validate
const validateFunc = require('validationator').validateFunc

runTests(validate, validateFunc)
