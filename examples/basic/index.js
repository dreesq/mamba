const mamba = require('../../index');

const app = mamba();
let i = 0;

const testMiddleware = async (req, res, next) => {
    ++i;
    next();
};

app.get('/', testMiddleware, testMiddleware, testMiddleware, async (req, res) => {
    res.end('Done');
});

app.use((req, res, next, error) => {
    console.log(error);
    res.end('X');
});

app.listen(8080, () => console.log('listening on port 8080'));