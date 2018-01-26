const runTests = require('../tests')
const { validate, validateFunc, type } = require('../../dist')

runTests(validate, validateFunc, type)
