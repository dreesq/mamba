const {serialize} = require('cookie');
const fs = require('fs-extra');
const mime = require('mime-types');
const path = require('path');
const contentDisposition = require('content-disposition');

const onFinished = (res, stream) => {
    if (res.id === -1) {
        console.log('onFinished called twice for the same response');
    } else {
        stream.destroy();
    }

    res.id = -1;
};

const toArrayBuffer = buffer => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const pipeStreamOverResponse = (res, stream, size) => {
    res.onAborted(() => {
        onFinished(res, stream);
    });

    stream.on('data', chunk => {
        const ab = toArrayBuffer(chunk);
        let lastOffset = res.getWriteOffset();

        let [ok, done] = res.tryEnd(ab, size);

        if (done) {
            return onFinished(res, stream);
        }

        if (!ok) {
            stream.pause();

            res.ab = ab;
            res.abOffset = lastOffset;

            res.onWritable(offset => {
                let [ok, done] = res.tryEnd(
                    res.ab.slice(offset - res.abOffset),
                    size
                );

                if (done) {
                    onFinished(res, stream);
                } else if (ok) {
                    stream.resume();
                }

                return ok;
            });
        }
    });

    stream.on('error', e => {
        console.error('Unhandled stream error', e);
    });
};

/**
 * Modify default response
 * @param req
 * @param res
 * @returns {*}
 */

module.exports = (req, res) => {
    res._end = res.end;
    res._tryEnd = res.tryEnd;
    res.headers = res.headers || {};

    res.cookie = (key, value, options = {}) => {
        let setCookie = res.headers['Set-Cookie'] || '';
        let cookie = serialize(key, value, options);

        if (setCookie) {
            setCookie = `${setCookie};${cookie}`;
        }

        res.headers['Set-Cookie'] = setCookie;
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

        return res._end(result, encoding);
    };

    res.tryEnd = (ab, size) => {
        const {headers = {}, statusCode = '200'} = res;
        res.writeStatus(statusCode);

        for (const k in headers) {
            res.writeHeader(k, String(headers[k]));
        }

        return res._tryEnd(ab, size);
    };

    res.redirect = path => {
        res.status(301);
        res.header('Location', path);
        res.end();
    };

    res.json = result => {
        res.header('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    };

    res.download = (path, name) => {
        res.header('Content-Disposition', contentDisposition(name || path));
        return res.sendFile(path);
    };

    res.sendFile = async file => {
        file = path.join(path.dirname(require.main.filename), file);

        try {
            let stats = await fs.stat(file);
            let type = path.extname(file);
            let stream = fs.createReadStream(file);
            let size = stats.size;

            res.header('Content-Type', mime.lookup(type) || 'application/octet-stream');
            return pipeStreamOverResponse(res, stream, size);
        } catch (e) {
            console.error(e);
            res.end();
        }
    };

    return res;
};