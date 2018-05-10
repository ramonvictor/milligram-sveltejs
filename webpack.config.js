const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = (mode !== 'development');
const path = require('path');

const postcss = require('postcss');

module.exports = {
  entry: {
    bundle: ['./src/main.css', './src/main.js']
  },
  resolve: {
    extensions: ['.js', '.html']
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    rules: [
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            // cascade: false,
            // store: true,
            hotReload: true,
            preprocess: {
              style: ({ content, attributes, filename }) => {
                return (
                  postcss([
                    require('postcss-import'),
                    require('postcss-cssnext')()
                  ])
                  .process(content, { from: filename })
                  .then(result => {
                    return { code: result.css, map: null }
                  })
                  .catch(err => {
                    console.log('failed to preprocess style', err)
                    return
                  })
                )
              }
            }
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('postcss-import'),
                require('postcss-cssnext')()
              ]
            }
          }
        ]
      }
    ]
  },
  mode: 'development',
  plugins: [
    !prod && new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ].filter(Boolean),
  devServer: {
    contentBase: './public'
  },
  devtool: prod ? false: 'source-map'
};