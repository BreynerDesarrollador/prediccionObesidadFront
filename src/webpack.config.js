/**
 * Called with `npm run app:dev` || `npm run app:build`
 */
const path = require('path');
const Webpack = require('webpack');
const config = require('./webpack.config');

/** Is Development */
const isDev = process.env.NODE_ENV !== 'production';

/** Webpack Config */
config.entry = path.join(__dirname, 'App.js');
config.output = {
    filename: 'app.bundle.js',
    path: path.join(__dirname, 'dist'),
};
config.externals = undefined;

/** Development */
if (isDev) {
    /** Server Settings */
    const server = {
        domain: 'localhost',
        index: 'index.html',
        path: 'dist/',
        port: 3000,
        protocol: 'http',
        root: '/',
    };

    const host = `${server.protocol}://${server.domain}:${server.port}`;
    const publicPath = `${host}/${server.path}`;

    config.output.publicPath = publicPath;
    config.devServer = {
        compress: true,
        host: '0',
        index: server.index,
        openPage: server.root,
        overlay: {
            warnings: false,
            errors: true,
        },
        port: server.port,
        public: host,
        publicPath,
        stats: config.stats,
    };
    config.optimization = {
        minimize: false,
    };
    config.plugins.push(new Webpack.HotModuleReplacementPlugin());
}

/** Export */
module.exports = config;