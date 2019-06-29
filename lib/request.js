const {parse: parseQuery} = require('querystring');
const {parse: parseCookies} = require('cookie');

/**
 * Tries parsing json request
 * @param req
 * @param res
 * @returns {Promise<any>}
 */

const parseJson = (req, res) => new Promise((resolve, reject) => {
    let buffer;

    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);

        if (isLast) {
            try {
                let json = JSON.parse(buffer ? Buffer.concat([buffer, chunk]) : chunk);
                resolve(json);
            } catch(e) {
                console.error(e);
                resolve({});
            }

            return;
        }

        buffer = Buffer.concat(buffer ? [buffer, chunk] : [chunk]);
    });
});

/**
 * Modify default request
 * @param req
 * @param res
 * @returns {Promise<*>}
 */

module.exports = async (req, res) => {
    const headers = {};
    req.forEach((k, v) => headers[k] = v);
    req.headers = headers;

    req.method = req.getMethod();
    req.query = parseQuery(req.getQuery()) || {};
    req.cookies = parseCookies(req.getHeader('Cookie')) || {};
    req.ip = new Uint8Array(res.getRemoteAddress());

    req.params = {};
    if (req.path.includes(':')) {
        const matches = req.path.match(/:([A-Za-z0-9_-]+)/g);

        if (matches) {
            for (let i = 0, len = matches.length; i < len; i++) {
                const name = matches[i];
                req.params[name.substr(1)] = req.getParameter(i);
            }
        }
    }

    req.body = await parseJson(req, res);
    return req;
};