const runTests = require('../tests')
const validate = require('../../src').validate
const validateFunc = require('../../src').validateFunc

runTests(validate, validateFunc)
