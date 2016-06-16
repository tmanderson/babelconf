const _ = require('lodash')
const request = require('request')
const cheerio = require('cheerio')

const defer = require('../util/defer')
const resources = require('../util/resources')

module.exports = function fetchPluginListing() {
  var p = defer()

  request('https://babeljs.io/docs/plugins/', function(err, res, body) {
    if(err) return p.reject(err)

    const $ = cheerio.load(body)
    const $types = $('h2')

    const plugins = _.groupBy(
      $('h2').nextUntil('h2').filter('ul')
        .map(function() {
          const $list = $(this)
          const type = $list.prevAll('h2').first().text()

          return {
            type: type,
            name: $list.prevAll('h3').first().text(),
            items: $list.find('li > a').map(function() {
              const $el = $(this)
              const moduleName = $el.attr('href').split('/').pop()
              const modulePrefix = /preset/i.test(type) ? 'babel' : 'babel-plugin'

              return {
                name: $el.text(),
                value: {
                  name: /preset/i.test(type) ? $el.text() : moduleName,
                  module: `${modulePrefix}-${moduleName}`
                }
              }
            }).get()
          }
        }).get(),
      'type'
    )

    p.resolve(plugins)
  })

  return p.promise
}
