const uws = require('uWebSockets.js');
const core = require('./lib/core');
const socket = require('./lib/socket');
const path = require('path');

/**
 * Instance object
 */

let app;

/**
 * Default export
 * @type {(function(*=): *)|*}
 */

exports = module.exports = create;

/**
 * Create app helper
 * @type {function(): *}
 */

function create(config) {
    if (config.key && config.cert) {
        app = uws.SSLApp({
            key_file_name: opts.key,
            cert_file_name: opts.cert
        });
    } else {
        app = uws.App();
    }

    app.__MAMBA__ = true;
    app.config = config;
    core.init(app);
    socket.init(app);
    return app;
};

/**
 * Static middleware
 * @param directory
 * @returns {Function}
 */

exports.static = (directory = '') => {
    const toPath = (req, directory) => {
        let result = path.normalize(req.url.replace(`/${directory.replace('./', '')}`, ''));
        return result;
    };

    return {
        path(path) {
            return `${path}/*`;
        },
        handler(req, res, next) {
            let method = req.method;

            if (method !== 'get' && method !== 'head') {
                res.end();
                next(true);
            }

            res.sendFile(`${directory}/${toPath(req, directory)}`);
            next(true);
        }
    }
};
