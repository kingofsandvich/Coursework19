var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {
	entry: path.resolve(__dirname,'app/index.js'),
	output: {
		path: path.resolve(__dirname,'dist'),
		filename: 'index.js'
	},

	module:{
		rules:[
			{test: /\.(js)$/, use: 'babel-loader'},
			{test: /\.css$/, use: ['style-loader','css-loader']}
		]
	},
	mode: 'development',
	plugins: [
		new HtmlWebpackPlugin({
				template: path.resolve(__dirname,'app/index.html')
		}),
		new BundleTracker({filename: './webpack-stats.json'})
	]
}