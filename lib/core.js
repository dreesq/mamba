const makeRequest = require('./request');
const makeResponse = require('./response');

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
    if (!middlewares[index] && !req.aborted) {
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

        app[m] = (path, ...args) => {
            const cb = args.pop();

            const errorHandler = stack[stack.length - 1];
            const middlewares = [
                ...stack.slice(0, -1),
                ...args
            ];

            app[`_${m}`](path, async (res, req) => {
                req.route = path;

                res.onAborted(() => {
                    req.aborted = true;
                });

                req.app = app;
                res.app = app;

                const [newReq, newRes] = await Promise.all([
                    makeRequest(req, res),
                    makeResponse(req, res)
                ]);

                try {
                    await runMiddlewares(middlewares, 0, cb, newReq, newRes);
                } catch(e) {
                    if (typeof errorHandler === 'function' && errorHandler.length === 4) {
                        return errorHandler(newReq, newRes, null, e);
                    }

                    if (!req.aborted) {
                        res.end();
                    }
                }
            });
        };
    }
};

/**
 * Use stack
 * @type {Array}
 */

const stack = [];

/**
 * Allow create global middle wares
 * @param app
 */

const setupUse = (app) => {
    app.use = (...args) => {
        stack.push(args);
    };
};

/**
 * Init method of core
 * @param app
 */

exports.init = app => {
    modifyListen(app);
    modifyHelpers(app);
    setupUse(app);

    /**
     * 404 Route
     */

    app.any('*', (req, res) => res.status(404).end(`Route '${req.path}' could not be found`));
};