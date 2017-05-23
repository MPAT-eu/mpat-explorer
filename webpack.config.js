var webpack = require('webpack');
var path = require('path');
var stage = process.env.NODE_ENV || 'dev';

let getPlugins = (stage) => {

  const env = (stage) => (
    new webpack.DefinePlugin({
                               'process.env': {
                                 NODE_ENV: `'${stage}'`,
                               },
                               DEBUG: stage !== 'production'
                             })
  );

  var plugins = [
    env(stage)
  ];
  return plugins;
};

var createConfig = (entry, extraPlugin = [], extraLoader = []) => ({
  context: __dirname,
  entry,
  module: {
    loaders: [
      { test: /\.js$/, loader: 'es6-loader' }
    ]
  },
  output: {
    path: __dirname,
    filename: '[name].min.js',
    libraryTarget: 'var',
    // `library` determines the name of the global variable
    library: '[name]'
  },
  externals: {},
  plugins: getPlugins(stage),
  resolve: {
    extensions: ['.js']
  }
});

const config = createConfig({
                              explorer: [
                                './LayoutIO.js'
                              ]
                            }
);

module.exports = [config];
