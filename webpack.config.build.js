const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const envargv = JSON.parse(process.env['npm_config_argv']).cooked;
const targ = envargv[envargv.indexOf('--variant') + 1];
const outputPath = path.join(__dirname, targ, 'dist');
const target = targ;

var variant = targ.split('/')[targ.split('/').length - 1];

if (variant.length == 0) variant = targ.split('/')[targ.split('/').length - 2];

function copyToCampaign(c) {
    console.log('======================================') 
    console.log('======================================')
    console.log('======================================')
    console.log('======================================')
    console.log('======================================')
    console.log('======================================')
};


module.exports = env => {
    return {
    mode: 'development',
    context: path.join(__dirname, target),
    entry: {
        'main': './js/main.js'
    },
    output: {
        path: outputPath,
        publicPath: './'
    },
 devServer: {
    inline: true,
    port: 3000
  },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                  'file-loader',
                  {
                    loader: 'image-webpack-loader',
                    options: {
                      disable: true, // webpack@2.x and newer
                    },
                  },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'resolve-url-loader'
                    },
                    {
                        loader: 'sass-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Custom template',
            filename: `${variant}.html`,
            template: 'html/index.html',
            inlineSource: '.(js|css)$' // embed all javascript and css inline
        }),
        new HtmlWebpackInlineSourcePlugin(),
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', copyToCampaign)
            }
        }
    ]
}
}