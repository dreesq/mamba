const uws = require('uWebSockets.js');
const core = require('./lib/core');
const socket = require('./lib/socket');

/**
 * Create app helper
 * @type {function(): *}
 */

exports.create = create = (config = {}) => {
    let app;

    if (config.key && config.cert) {
        app = uws.SSLApp({
            key_file_name: opts.key,
            cert_file_name: opts.cert
        });
    } else {
        app = uws.App();
    }

    app.config = config;
    core.init(app);
    socket.init(app);
    return app;
};

/**
 * Default export
 * @type {(function(*=): *)|*}
 */

exports = module.exports = create;
