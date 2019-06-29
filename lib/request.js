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

module.exports = async (req, res) => {
    req.method = req.getMethod();
    req.body = await parseJson(req, res);
    return req;
};