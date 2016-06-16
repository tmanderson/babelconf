module.exports = function(babelrc) {
  return [
    {
      type: 'confirm',
      message: 'Does this look all right?\n' + JSON.stringify(babelrc, null, 2),
      name: 'complete'
    }
  ]
}
