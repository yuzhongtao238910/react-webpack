module.exports = function (content) {
	// 清楚文件内容之中的console.log
	return content.replace(/console\.log\(.*\);?/g, '')
}