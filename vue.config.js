module.exports = {
	//Setting này effect trang index.html
	publicPath: process.env.NODE_ENV !== 'development' ? 'CONFIG_URL_CDN/cegov' : '/',

	// //Cấu hình lại devServer tối ưu CPU trên VDI
	// devServer: {
	// 	disableHostCheck: true,
	// 	hot: false, // không thực hiện hot render template
	// 	liveReload: false, // không tự reload trình duyệt sau khi build
	// 	watchOptions: {
	// 	  poll: 60000 // Mỗi 60 giây quét có file thay đổi thì build lại để update code mới
	// 	},
	// 	port: process.env.NODE_PORT,
	// 	host: '0.0.0.0',
	// 	public: 'localhost:8080',
	// 	headers: {
	// 		'Access-Control-Allow-Origin': '*',
	// 		'Access-Control-Allow-Headers': '*',
	// 		'Access-Control-Allow-Methods': '*'
	// 	  }
	// },

	//Cấu hình build publish
	chainWebpack: (config) => {
		config.plugins.delete('prefetch');
		config.module.delete('eslint')
	},
	configureWebpack: {
		devtool: 'eval',
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: Infinity,
				minSize: 120000,
				maxSize: 250000,
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name(module) {
							const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
							return `npm.${packageName.replace('@', '')}`;
						},
					},
				},
			}
		}
	}
};