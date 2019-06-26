var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	cache: true,
	entry: {
		wcrapp: [ "./webcorrector-app/test",
		process.env.NODE_ENV != 'production' ? 'webpack-dev-server/client?http://localhost:8080' : './webcorrector-app/test'
		]

		// bootstrap: ["!bootstrap-webpack!./app/bootstrap/bootstrap.config.js", "./app/bootstrap"],
		// react: "./app/react"
	},
	output: {
		path: path.join(__dirname, "public"),
		publicPath: "public/",
		filename: "[name]-bundle.js"
	},
	externals: { 
		dust: "dust" 
	},
	 // resolve: {
  //   // Tell webpack to look in node_modules, then bower_components when resolving dependencies
  //   // If your bower component has a package.json file, this is all you need.
  //   	modulesDirectories: ["node_modules", "bower_components"]
  // 	},
	module: {
		loaders: [
			// required to write "require('./style.css')"
			{ test: /\.css$/,    loader: "style-loader!css-loader?-minimize" },
			// { test: /[\/\\]jquery-plugins[\/\\].js$/, loader: "imports-loader?$=jquery" },
			{ test: /\.less$/,    loader: "style-loader!css-loader?-minimize!less-loader" },
			// { test: /\.dust$/, loader: "dust-loader?whitespacestrue" },

			// Extract css files
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            // },
            // Optionally extract less files
            // or any other compile-to-css language
            // {
            //     test: /\.less$/,
            //     loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            // },
            {
      			test: /\.(png|jpg)$/,
      			loader: 'url?limit=25000'
    		},
            // You could also use other loaders the same way. I. e. the autoprefixer-loader
			// required for bootstrap icons
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" }

		]
	},
	resolve: {
		alias: {
			// 'dustjs-linkedin': path.join(__dirname, 'local_modules/dustjs-linkedin/lib/dust.js'),
			// 'dustjs-helpers': path.join(__dirname, 'local_modules/dustjs-helpers/lib/dust-helpers-webpack.js'),
			// 'dust': path.join(__dirname, 'node_modules/dustjs-linkedin/lib/dust.js'),
			// 'jflux-dust': path.join('/Volumes/RAID1TB/Users/kris/Documents/Projects/jflux-dust/releases/jflux-dust-latest.js'),
			'jflux-dust': path.join('/Volumes/RAID1TB/Users/kris/Documents/Projects/jflux-dust/src/jflux.js')
			// 'jflux-lib': path.join(__dirname, 'node_modules/jflux/releases/1.2.1/jflux-1.2.1.js'),
			// 'jquery': path.join(__dirname, 'node_modules/jquery/dist/jquery.js')
			// 'jflux-lib': path.join(__dirname, 'node_modules/jflux/releases/1.2.1/jflux-1.2.1.min.js')
            // 'Backbone': '../local_modules/backbone',
            // 'Marionette': '../bower_components/marionette/lib/core/backbone.marionette.js'
            // 'Underscore': '../bower_components/underscore/underscore-min.js',
		}
	},
	plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.optimize.UglifyJsPlugin({ output: {comments: false} }),
        new webpack.optimize.LimitChunkCountPlugin({
        	maxChunks: 1
        }),
        new webpack.ResolverPlugin(
		  new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
		),
		new webpack.DefinePlugin({
                    DEBUG: true,
                    PRODUCTION: false
        }),		
     	new webpack.ProvidePlugin({
			// Automtically detect jQuery and $ as free var in modules
			// and inject the jquery library
			// This is required by many jquery plugins
			// jQuery: "jquery",
			dust: 'dust',
			$$: 'jflux-dust',
			// $$: 'jflux-lib',
			Backbone: 'Backbone'
			// ,
			// wcr$: "jquery"
		})
	]
};
