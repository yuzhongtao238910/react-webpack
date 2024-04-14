// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const MyInlineWebpackPlugin = require("../plugins/myInline-webpack-plugin.js")
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

module.exports = {
	entry: "./src/main.js",
	output: {
		path: path.resolve(__dirname, '../dist'),
		publicPath: "/",
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
			chunks: 'all'
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
	// 	host: 'localhost',
	// 	port: '3333',
	// 	hot: true,
	// 	historyApiFallback: true // 解决history的问题
	// }
}