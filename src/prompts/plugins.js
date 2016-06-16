const _ = require('lodash')

module.exports = function(items) {
  var groups = Object.keys(items)
  var plugin = 1

  return groups.map(function(name, i) {
    return {
      type: 'checkbox',
      name: /presets/i.test(name) ? 'presets' : `plugins${plugin++}`,
      message: `Choose the ${name.replace(/s$/, '')}s to insall`,
      choices: _.flatten(items[name].map(function(plugin) {
        return plugin.items
      }))
    }
  })
}
