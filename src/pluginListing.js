const Promise = require('bluebird')

function defer() {
  var resolve, reject;

  var promise = new Promise(function() {
      resolve = arguments[0];
      reject = arguments[1];
  });

  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
}

module.exports = function() {
  var p = defer()

  request('https://babeljs.io/docs/plugins/', function(err, res, body) {
    if(err) return p.reject(err)

    var $ = cheerio.load(body);
    var $types = $('h2')

    var plugins = _.groupBy(
      $('h2').nextUntil('h2').filter('ul')
        .map(function() {
          var $list = $(this)

          return {
            type: $list.prevAll('h2').first().text(),
            name: $list.prevAll('h3').first().text(),
            items: $list.find('li > a').map(function() {
              var $el = $(this)
              var moduleName = $el.attr('href').split('/').pop()

              return {
                name: $el.text(),
                value: `babel-plugin-${moduleName}`
              };
            }).get()
          }
        }).get(),
      'type'
    );

    fs.writeFileSync(path.join(PLUGINS_PATH), JSON.stringify(plugins))
    p.resolve(plugins)
  })

  return p.promise
}
