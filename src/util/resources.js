const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const chalk = require('chalk')
const Promise = require('bluebird')

const RESOURCE_DIR = path.join(require('os').homedir(), '.babel-config-cli')
const BABEL_PATH = path.join(process.cwd(), '.babelrc')
const PLUGINS_PATH = path.join(RESOURCE_DIR, 'plugins.json')
const PACKAGE_JSON = path.join(process.cwd(), 'package.json')

const defer = require('./defer')
const fetchListing = require('./fetchListing')
var listing

module.exports = {
  updateNPMDependencies: function(modules, dev) {
    console.log(chalk.green('Installing plugin modules...'))

    modules.push('babel-cli');

    dev = !(dev === false)

    return new Promise(function(resolve, reject) {
      const child = spawn('npm', ['install', `--save${dev ? '-dev' : ''}`].concat(modules), {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe'
      })

      child.on('close', resolve.bind(null))
      child.on('error', reject.bind(null))
    })
  },

  writeBabelRc: function(babelrc, merge) {
    var current = this.existingBabelRc()
    if(merge) babelrc = _.mapValues(babelrc, function(val, key) {
      return _.uniq(current[key].concat(val))
    })

    fs.writeFileSync(BABEL_PATH, JSON.stringify(babelrc, null, 2))
  },

  existingBabelRc: function() {
    return fs.existsSync(BABEL_PATH) && JSON.parse(fs.readFileSync(BABEL_PATH))
  },

  updateLocalPluginListing: function(plugins) {
    if(!fs.existsSync(RESOURCE_DIR)) fs.mkdirSync(RESOURCE_DIR)
    fs.writeFileSync(path.join(PLUGINS_PATH), JSON.stringify(plugins))
    return plugins
  },

  localPluginListing: function() {
    return listing || fs.existsSync(RESOURCE_DIR) &&
      fs.existsSync(PLUGINS_PATH) &&
        (listing = JSON.parse(fs.readFileSync(PLUGINS_PATH)))
  },

  fetchListing: function() {
    return fetchListing().then(this.updateLocalPluginListing)
  }
}
