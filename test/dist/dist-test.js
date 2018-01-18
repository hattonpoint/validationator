const runTests = require('../tests')
const validate = require('../../dist').validate
const validateFunc = require('../../dist').validateFunc

runTests(validate, validateFunc)
