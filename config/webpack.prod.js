// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const MyInlineWebpackPlugin = require("../plugins/myInline-webpack-plugin.js")
// const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const crypto = require('crypto');
const getStyleLoaders = (pre) => {
    return [
        // style-loader 自带hmr
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
            // 处理css兼容性问题
            // 配合package.json之中的browserslist来指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        'postcss-preset-env'
                    ]
                }
            }
        },
        pre
    ].filter(Boolean)
}

const PUBLIC_PATH = '/';

const MAX_REQUEST_NUM = 20;
// 指定一个 module 可以被拆分为独立 区块（chunk） 的最小源码体积（单位：byte）
const MIN_LIB_CHUNK_SIZE = 10 * 1000;

const isModuleCSS = (module) => {
  return (
    // mini-css-extract-plugin
    module.type === `css/mini-extract` ||
    // extract-css-chunks-webpack-plugin (old)
    module.type === `css/extract-chunks` ||
    // extract-css-chunks-webpack-plugin (new)
    module.type === `css/extract-css-chunks`
  );
};

module.exports = {
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: PUBLIC_PATH,
        filename: 'static/js/[name].[contenthash:10].js',
        chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: true
    },
    module: {
        rules: [
            // css
            {
                test: /\.css$/,
                use: getStyleLoaders()
            },
            {
                test: /\.less$/,
                use: getStyleLoaders("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoaders("sass-loader")
            },
            {
                test: /\.styl$/,
                use: getStyleLoaders("stylus-loader")
            },
            {
                test: /\.(jpe?g|png|gif|webp|svg)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024 // 小于 10kb 就base64
                    }
                }
            },
            {
                test: /\.(woff2?|ttf)$/,
                type: 'asset/resource', // 原样输出
            },
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, '../src'),
                use: [{
                    loader: path.resolve(__dirname, '../loaders/clean-log-loader'),
                    options: {}
                } , {
                    loader: 'babel-loader',
                    options: {
                        // plugins: ['react-refresh/babel'], // js - hmr
                        cacheDirectory: true,
                        cacheCompression: false // 不压缩
                    }
                }]
                
            }
        ]
    },
    // 当项目很大的时候在启用多进程打包
    // 处理html
    plugins: [
        new MyInlineWebpackPlugin([/runtime(.*)\.js$/g, ]),
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname, '../public'),
                    to: path.resolve(__dirname, '../dist'),
                    globOptions: {
                        ignore: ["**/index.html"]
                    }
                }
            ],

        }),
        // 提取css为单独文件
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:10].css',
            chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
        }),
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules',
            cache: true,
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache')
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html')
        }),
        // new ReactRefreshWebpackPlugin()  // js - hmr
    ],
    mode: 'production',
    devtool: "source-map",
    optimization: {
        splitChunks: {
            maxInitialRequests: MAX_REQUEST_NUM,
            maxAsyncRequests: MAX_REQUEST_NUM,
            minSize: MIN_LIB_CHUNK_SIZE,
            cacheGroups: {
                defaultVendors: false,
                default: false,
                lib: {
                chunks: 'all',
                test(module) {
                    return (
                    module.size() > MIN_LIB_CHUNK_SIZE &&
                    /node_modules[/\\]/.test(module.identifier())
                    );
                },
                name(module) {
                    const hash = crypto.createHash('sha1');
                    if (isModuleCSS(module)) {
                    module.updateHash(hash);
                    } else {
                    if (!module.libIdent) {
                        throw new Error(
                        `Encountered unknown module type: ${module.type}. Please check webpack/prod.client.config.js.`,
                        );
                    }
                    hash.update(
                        module.libIdent({ context: path.join(__dirname, '../') }),
                    );
                    }
        
                    return `lib.${hash.digest('hex').substring(0, 8)}`;
                },
                priority: 3,
                minChunks: 1,
                reuseExistingChunk: true,
                },
                shared: {
                chunks: 'all',
                name(module, chunks) {
                    return `shared.${crypto
                    .createHash('sha1')
                    .update(
                        chunks.reduce((acc, chunk) => {
                        return acc + chunk.name;
                        }, ''),
                    )
                    .digest('hex')
                    .substring(0, 8)}${isModuleCSS(module) ? '.CSS' : ''}`;
                },
                priority: 1,
                minChunks: 2,
                reuseExistingChunk: true,
                },
            },
        },
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}.js`
        },
        minimizer: [new CssMinimizerWebpackPlugin(), new TerserWebpackPlugin()]
    },
    resolve: {
        // 自动补全文件扩展名字
        extensions: ['.js', '.jsx'],
    },
    // devServer: {
    //  host: 'localhost',
    //  port: '3333',
    //  hot: true,
    //  historyApiFallback: true // 解决history的问题
    // }
}
