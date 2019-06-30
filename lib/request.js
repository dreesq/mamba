const {parse: parseQuery} = require('querystring');
const {parse: parseCookies} = require('cookie');
const Busboy = require('busboy');

/**
 * Returns request data
 * @param req
 * @param res
 * @returns {Promise<any>}
 */

const getData = (req, res) => new Promise(resolve => {
    let buffer;

    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);

        if (isLast) {
            return resolve(buffer ? Buffer.concat([buffer, chunk]) : chunk);
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

const parseData = (req, res) => new Promise(resolve => {
    const parse = data => {
        req.body = {};

        const type = req.headers['content-type'].split(';')[0];

        if (!data.length) {
            resolve();
        }

        switch (type) {
            case 'application/x-www-form-urlencoded':
                req.body = parseQuery(data.toString());
                resolve();
                break;

            case 'application/json':
                try {
                    req.body = JSON.parse(data);
                } catch (e) {
                    console.error(e);
                }
                resolve();
                break;

            case 'multipart/form-data':
                req.files = {};
                const busboy = new Busboy({headers: req.headers});

                busboy.on('file', (name, file, filename, encoding, mime) => {
                    file.on('data', data => {
                        req.files = {
                            ...req.files,
                            [name]: {
                                name,
                                length: data.length,
                                data,
                                encoding,
                                mime
                            }
                        };
                    });

                    file.on('end', () => {

                    });
                });

                busboy.on('field', (name, value) => {
                    req.body[name] = value;
                });

                busboy.end(data);
                busboy.on('finish', resolve);
                break;

            default:
                req.body = data;
                resolve();
                break;
        }
    };

    getData(req, res).then(parse);
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
    req.params = {};
    req.path = req.getUrl();

    if (req.route.includes(':')) {
        const matches = req.route.match(/:([A-Za-z0-9_-]+)/g);

        if (matches) {
            for (let i in matches) {
                const name = matches[i];
                req.params[name.substr(1)] = req.getParameter(i);
            }
        }
    }

    req.method !== 'get' ? await parseData(req, res) : null;
    return req;
};