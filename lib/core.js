const request = require('./request');
const response = require('./response');

/**
 * Recursively runs middle wares
 * @param middlewares
 * @param index
 * @param callback
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const runMiddlewares = async (middlewares = [], index = 0, callback, req, res) => {
    if (req.aborted) {
        return;
    }

    if (!middlewares[index]) {
        return callback(req, res);
    }

    await middlewares[index](req, res, next => {
        if (next) {
            return;
        }

        ++index;
        runMiddlewares(middlewares, index, callback, req, res);
    });
};

/**
 * Modifies listen to allow not passing callback
 * @param app
 */

const modifyListen = app => {
    app._listen = app.listen;

    app.listen = (port, cb) => {
        let callback;

        if (!cb) {
            callback = token => {
                if (!token) {
                    console.error('Failed to listen on port.');
                }
            };
        } else {
            callback = token => {
                if (token) {
                    return cb();
                } else {
                    console.error('Failed to listen on port.');
                }
            }
        }

        app._listen(port, callback);
    };
};

/**
 * Modifies the helpers to allow running middle wares
 * @param app
 */

const modifyHelpers = app => {
    const methods = [
        'get',
        'post',
        'any',
        'delete',
        'head',
        'put',
        'patch',
        'options'
    ];

    for (const m of methods) {
        app[`_${m}`] = app[m];

        app[m] = (...args) => {
            const method = args.shift();
            const cb = args.pop();

            app[`_${m}`](method, async (res, req) => {
                req = request(req);
                res = response(res);

                res.onAborted(() => {
                    req.aborted = true;
                });

                await runMiddlewares(args, 0, cb, req, res);
            });
        };
    }
};

/**
 * Init method of core
 * @param app
 */

exports.init = app => {
    modifyListen(app);
    modifyHelpers(app);
};