const path = require("path");
const webpack = require("webpack");
const _ = require("lodash");
// Configs
const swcConfig = require("./swc.json");
// Plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const assetFileExtensions = [
	"png",
	"jpg",
	"jpeg",
	"gif",
	"mp3",
	"mp4",
	"ogg"
];

module.exports = env => ({
	mode: "development",
	entry: "./src/index.jsx",
	output: {
		path: path.join(__dirname, "dist"),
		filename: "assets/scripts/[name].js",
		chunkFilename: "assets/scripts/[name].js",
		assetModuleFilename: "assets/media/[name][ext]",
		publicPath: env.WEBPACK_SERVE ? "/" : "./"
	},
	module: {
		rules: [
			{
				test: /\.(m|c)?(j|t)sx?$/i,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: "swc-loader",
					options: swcConfig
				}
			},
			{
				test: /\.s?[ac]ss$/i,
				use: [
					env.mode === "production" ? {
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: "../../"
						}
					} : "style-loader",
					{
						loader: "css-loader",
						options: {
							importLoaders: true,
							// Enable this if you want the css classNames to be transformed.
							// vvvvvvvvvvvv
							// modules: {
							// 	localIdentName: "[local]-[hash:base64:6]"
							// }
						}
					},
					"sass-loader"
				]
			},
			{
				test: new RegExp(`\\.(${assetFileExtensions.join("|")})$`, "i"),
				type: "asset/resource"
			},
			{
				test: /\.svg$/i,
				use: [
					"swc-loader",
					"@svgr/webpack",
					{
						loader: "file-loader",
						options: {
							name: "assets/media/[name].[ext]"
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [
			".jsx",
			".js",
			".mjs",
			".cjs",
			".svg",
			".scss",
			".css",
			".ts",
			".tsx",
			...assetFileExtensions.map(e => "." + e)
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: path.join(__dirname, "index.html"),
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true
			},
			// favicon: path.join(__dirname, "public", "favicon.ico"),
			title: require("../../package.json").name
		}),
		env.mode === "production" && new MiniCssExtractPlugin({
			filename: "assets/styles/[name].css",
			chunkFilename: "assets/styles/[name].chunk.css"
		}),
		new webpack.ProvidePlugin({
			React: "react",
			ReactDOM: "react-dom"
		})
	].filter(plugin => plugin),
	devServer: {
		static: path.join(__dirname, "dist"),
		port: 3000,
		historyApiFallback: true
	}
});