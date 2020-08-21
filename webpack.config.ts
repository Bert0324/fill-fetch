import { Configuration, DefinePlugin } from 'webpack';
// @ts-ignore
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    mode: 'production',
    entry: {
        index: `${__dirname}/src/index.ts`,
    },
    output: {
        path: `${__dirname}/dist`,
        filename: `[name].min.js`,
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.(tsx|ts|js)?$/,
                loader: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        // process.env.COLUMBUS_ENV !== 'pro' &&
        //     new HtmlWebpackPlugin({
        //         inject: true,
        //         template: `${__dirname}/public/test.html`,
        //     }),
        new DefinePlugin({
            ENV: JSON.stringify(process.env.COLUMBUS_ENV || 'pro'),
        }),
        new CleanWebpackPlugin(),
    ].filter(Boolean),
    optimization: {
        minimizer: [new TerserWebpackPlugin()],
    },
    devServer: {
        contentBase: `${__dirname}/dist`,
        compress: true,
        port: 8081,
        open: true,
        proxy: {},
    },
} as Configuration;
