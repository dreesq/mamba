const {serialize} = require('cookie');

/**
 * Modify default response
 * @param req
 * @param res
 * @returns {*}
 */

module.exports = (req, res) => {
    res._end = res.end;
    res.headers = res.headers || {};

    res.cookie = (key, value, options = {}) => {
        let cookie = serialize(key, value, options);
        res.headers['Set-Cookie'] = cookie;
    };

    res.header = (key, value) => {
        res.headers[key] = value;
    };

    res.status = status => {
        res.statusCode = String(status);
        return res;
    };

    res.end = (result, encoding = 'utf-8') => {
        const {headers = {}, statusCode = '200'} = res;
        res.writeStatus(statusCode);

        for (const k in headers) {
            res.writeHeader(k, String(headers[k]));
        }

        res._end(result, encoding);
    };

    res.json = result => {
        res.end(JSON.stringify(result));
    };

    return res;
};