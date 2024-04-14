module.exports = {
	extends: ['react-app'], // 继承官方的规则
	parserOptions: {
		babelOptions: {
			presets: [
				// 解决页面报错问题
				["babel-preset-react-app", false],
				"babel-preset-react-app/prod"
			]
		}
	}
}