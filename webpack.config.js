const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const config = require('config');


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
        rules: [
            {
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
                test: /\.(png|jpg|gif|svg|ttf|woff|woff2|eot)$/,
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
        open: true,
        watchContentBase: true,
        port: config.get('clientport')
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',
    plugins: [
        new CleanWebpackPlugin(['dist/**.js'], {
            beforeEmit: true
        }),
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'SOCKETIO_URI': JSON.stringify(`//${config.get('host')}:${config.get('apiport')}`)
        }),
    ]
}



// if (process.env.NODE_ENV === 'production') {
//   module.exports.devtool = '#source-map'
//   // http://vue-loader.vuejs.org/en/workflow/production.html
//   module.exports.plugins = (module.exports.plugins || []).concat([
//     new webpack.DefinePlugin({
//       'process.env': {
//         NODE_ENV: '"production"'
//       }
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//       sourceMap: true,
//       compress: {
//         warnings: false
//       }
//     }),
//     new webpack.LoaderOptionsPlugin({
//       minimize: true
//     })
//   ])
// }
