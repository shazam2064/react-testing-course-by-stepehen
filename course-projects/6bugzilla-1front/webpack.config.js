const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/index.js',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'none' : 'inline-source-map',
    bail: true,
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'build'),
        },
        compress: true,
        port: 3000,
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].[chunkhash].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-flow',
                        ],
                        plugins: [
                            'babel-plugin-styled-components',
                            '@babel/plugin-proposal-class-properties',
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(scss|sass)$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/,
                use: 'file-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html',
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env),
        }),
    ],
};