const includesAny = (str, arrOfStr, options = {}) => {
  let includesAny = false

  if (options.ignoreCase) str = str.toLowerCase()
  if (options.stringify) str = JSON.stringify(str)

  for (let i = 0; i < arrOfStr.length; i++) {
    let search = arrOfStr[i]

    if (options.ignoreCase) search = search.toLowerCase()
    if (options.stringify) search = JSON.stringify(search)

    if (str.includes(search)) {
      includesAny = true
      break
    }
  }

  return includesAny
}

module.exports = includesAny
