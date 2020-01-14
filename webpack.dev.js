const merge = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");
const OpenBrowserPlugin = require("open-browser-webpack-plugin");

const host = "0.0.0.0";
const port = "8000";

// -------组装webpack配置----------
common.entry.push('webpack-dev-server/client?http://' + host + ':' + port + '/');
module.exports = merge(common, {
    mode: "development",
    plugins:[new OpenBrowserPlugin({ url: `http://${host}:${port}/test/demo1/` })],
    devServer: {
        disableHostCheck: true,
        progress: true,
        host,
        port,
        contentBase: path.join(__dirname, "./"),
        publicPath: "/dist/",
        hot: false,
        inline: false
    }
});
