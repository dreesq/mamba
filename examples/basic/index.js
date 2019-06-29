const mamba = require('../../index');

const app = mamba();
let i = 0;

const test = async (req, res, next) => {
    ++i;
    next();
};

app.get('/:x', test, async (req, res) => {
    res.end('XXX A');
});

app.post('/', async (req, res) => {
    res.json(req.body);
});

app.use((req, res, next, error) => {
    console.log(error);
    res.end('X');
});

app.listen(8080, () => console.log('listening on port 8080'));