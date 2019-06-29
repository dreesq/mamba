const {parse: parseQuery} = require('querystring');
const {parse: parseCookies} = require('cookie');

/**
 * Returns request data
 * @param req
 * @param res
 * @returns {Promise<any>}
 */

const getData = (req, res) => new Promise((resolve, reject) => {
    let buffer;

    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);

        if (isLast) {
            try {
                resolve(buffer ? Buffer.concat([buffer, chunk]) : chunk);
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
 * Based on content type, parses data
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

const parseData = async (req, res) => {
    let result = {};

    const data = await getData(req, res);
    const type = req.headers['content-type'].split(';')[0];

    switch(type) {
        case 'application/json':
            try {
                result = JSON.parse(data);
            } catch(e) {
                console.error(e);
            }
            break;

        case 'multipart/form-data':

            break;

        default:
            result = data;
            break;
    }

    return result;
};

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

    req.body = req.method !== 'get' ? await parseData(req, res) : {};
    return req;
};