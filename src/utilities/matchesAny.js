module.exports = (test, arr) => {
  let returnVal = false
  arr.forEach(item => {
    if (item === test) returnVal = true
  })
  return returnVal
}
