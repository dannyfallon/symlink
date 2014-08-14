
// https://github.com/npm/npm/blob/master/lib/utils/link.js#L19

var fs = require('mz/fs')
var path = require('path')

var win = process.platform === 'win32'

module.exports = function (from, to, type) {
  var og = from = path.resolve(from)
  to = path.resolve(to)
  if (!win) {
    var target = from = path.relative(path.dirname(to), from)
    if (target.length >= from.length) target = from
  }

  return fs.lstat(to).then(function (stats) {
    // if it's not a symbolic link, we recreate the link for sure
    if (!stats.isSymbolicLink()) return fs.unlink(to).then(returnTrue, returnTrue)
    return fs.realpath(to).then(function (resolved) {
      // we only recreate the link if it does not link to the same file
      if (resolved === og) return false // no need to create a symlink
      return fs.unlink(to).then(returnTrue, returnTrue)
    })
  }, function (err) {
    err = err.cause || err // fucking bluebird
    // if the link doesn't exist, we make it
    if (err.code !== 'ENOENT') throw err
    return true // create the link
  }).then(function (makeTheLink) {
    if (!makeTheLink) return
    return fs.symlink(from, to, type)
  })
}

function returnTrue() {
  return true
}