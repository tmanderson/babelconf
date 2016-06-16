var chalk = require('chalk')

module.exports = function() {
  return [
    {
      type: 'input',
      name: 'overwrite',
      message: `An existing .babelrc was found in the current directory (${process.cwd()})\n  Would you like to ${chalk.underline('O')}verwrite, ${chalk.underline('M')}erge, or ${chalk.underline('E')}xit`,
      validate: function(input) {
        var answer = input.charAt(0)
        return /o|m|e/i.test(answer) ? true : 'An answer of `overwrite`, `merge` or `cancel` must be supplied'
      }
    }
  ]
}
