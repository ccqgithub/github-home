var webpack = require("webpack");

// returns a Compiler instance
webpack({
  entry: {
    index: '../src/pkg/index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/built'
  }
}, function(err, stats) {
  if (err) return console.warn(err);
  var jsonStats = stats.toJson();
  if (jsonStats.errors.length > 0)
    return console.warn(jsonStats.errors);
  if (jsonStats.warnings.length > 0)
    console.warn(jsonStats.warnings);
  console.log('success');
});
