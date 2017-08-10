const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const StartServerPlugin = require('start-server-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filter = a => a.filter(Boolean)

module.exports = {
  entry: filter([
    isDev && 'webpack/hot/poll?1000',
    './server/index'
  ]),
  watch: isDev,
  target: 'node',
  externals: [nodeExternals({
    whitelist: isDev ? ['webpack/hot/poll?1000'] : undefined
  })],
  module: {
    rules: [{
      test: /\.js?$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  plugins: filter([
    isDev && new StartServerPlugin('server.js'),
    new webpack.NamedModulesPlugin(),
    isDev && new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        "BUILD_TARGET": JSON.stringify('server')
      }
    }),
  ]),
  output: {
    path: path.join(__dirname, '.build'),
    filename: 'server.js'
  }
}
