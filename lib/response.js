module.exports = (res) => {
    res.json = result => {
        res.end(JSON.stringify(result));
    };

    return res;
};