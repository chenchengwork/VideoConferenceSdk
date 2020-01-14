const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

// -------组装webpack配置----------
module.exports = merge(common, {
    mode: "production",
    devtool: false,
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true,
            uglifyOptions:{
                output: {
                    comments: false,
                    beautify: false
                }
            }
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ]
});
