const uws = require('uWebSockets.js');
const core = require('./lib/core');

/**
 * Create app helper
 * @type {function(): *}
 */

exports.create = create = (opts = {}) => {
    const app = uws.App();
    core.init(app);
    return app;
};

/**
 * Default export
 * @type {(function(*=): *)|*}
 */

module.exports = create;