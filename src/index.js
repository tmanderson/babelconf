
const _ = require('lodash')
const cli = require('inquirer')
const chalk = require('chalk')

const prompts = require('./prompts')
const resources = require('./util/resources')

console.log(chalk.green(require('./util/banner')))

function done() {
  console.log(chalk.green('Babel plugin update complete!'))
  process.exit()
}

function start(items) {
  cli.prompt(prompts.plugins(items))
    .then(function(selectedPlugins) {
      // reduce the answers to a `.babelrc` format
      var babelrc = _.reduce(selectedPlugins, function(babelrc, items, key) {
        var itemNames = items.map(function(i) { return i.name; })

        if(/plugins/.test(key)) babelrc.plugins = babelrc.plugins.concat(itemNames)
        else babelrc.presets = babelrc.presets.concat(itemNames)
        return babelrc
      }, { plugins: [], presets: [] })

      // get the module names from the user's selected plugins
      var modules = _.reduce(_.flatten(_.toArray(selectedPlugins)), function(modules, item) {
        return modules.concat(item.module)
      }, [])

      cli.prompt(prompts.confirmation(babelrc)).then(function(answers) {
        // restart the process if the user made a mistake
        if(!answers.complete) return start(items)

        // if there's an existing `.babelrc` ask the user how they want to handle
        // the updates
        if(!!resources.existingBabelRc()) {
          cli.prompt(prompts.save())
            .then(function(answers) {
              if(/^c/i.test(answers)) return process.exit()
              resources.writeBabelRc(babelrc, answers.overwrite === 'm')
              resources.updateNPMDependencies(modules).then(done)
            })
          }
          else {
            resources.writeBabelRc(babelrc)
            resources.updateNPMDependencies(modules).then(done)
          }
      })
    });
}

if(!resources.localPluginListing()) {
  resources.fetchListing().then(start)
}
else {
  start(resources.localPluginListing())
}
