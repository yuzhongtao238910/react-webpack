const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const getStyleLoaders = (pre) => {
	return [
		// style-loader 自带hmr
		"style-loader",
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
		path: undefined,
		filename: 'static/js/[name].js',
		chunkFilename: 'static/js/[name].chunk.js',
		assetModuleFilename: 'static/media/[hash:10][ext][query]'
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
				loader: 'babel-loader',
				options: {
					plugins: ['react-refresh/babel'], // js - hmr
					cacheDirectory: true,
					cacheCompression: false // 不压缩
				}
			}
		]
	},
	// 当项目很大的时候在启用多进程打包
	// 处理html
	plugins: [
		new EslintWebpackPlugin({
			context: path.resolve(__dirname, '../src'),
			exclude: 'node_modules',
			cache: true,
			cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache')
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../public/index.html')
		}),
		new ReactRefreshWebpackPlugin()  // js - hmr
	],
	mode: 'development',
	devtool: "cheap-module-source-map",
	optimization: {
		splitChunks: {
			chunks: 'all'
		},
		runtimeChunk: {
			name: entrypoint => `runtime-${entrypoint.name}.js`
		}
	},
	resolve: {
		// 自动补全文件扩展名字
		extensions: ['.js', '.jsx'],
	},
	devServer: {
		host: 'localhost',
		port: '3333',
		hot: true,
		historyApiFallback: true // 解决history的问题
	}
}