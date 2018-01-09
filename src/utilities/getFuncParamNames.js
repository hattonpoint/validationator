module.exports = func => {
  const STRIP_COMMENTS_DEFAULTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg
  const ARGUMENT_NAMES = /([^\s,]+)/g
  const fnStr = func.toString().replace(STRIP_COMMENTS_DEFAULTS, '')
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if (result[0] === '{' && result[result.length - 1 === '}']) result = result.slice(1, -1)
  if (result === null) result = []
  return result
}
