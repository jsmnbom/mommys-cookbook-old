const webpack = require('webpack');
module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                'window.Quill': 'quill/dist/quill.js',
                'Quill': 'quill/dist/quill.js',
            }),
        ],
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/mommys-cookbook/'
        : '/'
};