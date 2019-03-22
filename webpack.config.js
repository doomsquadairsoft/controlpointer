const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const config = require('config');
const controlpointerVersion = require('./package.json').version;
const CompressionPlugin = require('compression-webpack-plugin');
// const OfflinePlugin = require('offline-plugin');



module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    './src_client/index.js',
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [{
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.s[a|c]ss$/,
        loader: 'style!css!sass'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'img-loader',
            options: {
              plugins: [
                require('imagemin-gifsicle')({
                  interlaced: false
                }),
                require('imagemin-mozjpeg')({
                  progressive: true,
                  arithmetic: false
                }),
                require('imagemin-pngquant')({
                  floyd: 0.5,
                  speed: 2
                }),
                require('imagemin-svgo')({
                  plugins: [{
                      removeTitle: true
                    },
                    {
                      convertPathData: false
                    }
                  ]
                })
              ]
            }
          }
        ]
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.join(__dirname, 'src_client')
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    noInfo: false,
    overlay: true,
    contentBase: path.join(__dirname, "dist"),
    hot: false,
    open: false,
    watchContentBase: true,
    port: config.get('port') + 1,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    },
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __CONTROLPOINTER_VERSION__: JSON.stringify(controlpointerVersion)
    }),
    // new CleanWebpackPlugin(['dist/**.js'], {
    //     beforeEmit: true
    // }),
    new VueLoaderPlugin(),
    new CompressionPlugin({
      test: /\.js(\?.*)?$/i
    }),
    // new OfflinePlugin()
  ]
}



if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
