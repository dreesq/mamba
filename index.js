const uws = require('uWebSockets.js');
const core = require('./lib/core');

/**
 * Create app helper
 * @type {function(): *}
 */

exports.create = create = (opts = {}) => {
    let app;

    if (opts.key && opts.cert) {
        app = uws.SSLApp({
            key_file_name: opts.key,
            cert_file_name: opts.cert
        });
    } else {
        app = uws.App();
    }

    core.init(app);
    return app;
};

/**
 * Default export
 * @type {(function(*=): *)|*}
 */

module.exports = create;