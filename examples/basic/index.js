const mamba = require('../../index');

const app = mamba();

const testMiddleware = (req, res, next) => {
    res.end('Stopped');
    next(true);
};

app.get('/', testMiddleware, (req, res) => {
    res.end('Done');
});

app.listen(8080);