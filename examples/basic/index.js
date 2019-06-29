const mamba = require('../../index');

const app = mamba();
let i = 0;

const test = async (req, res, next) => {
    ++i;
    next();
};

app.get('/:x', test, async (req, res) => {
    const {x} = req.params;
    res.redirect(`/view/${x}`);
});

app.post('/', async (req, res) => {
    res.json(req.body);
});

app.use((req, res, next, error) => {
    console.log(error);
    res.end('X');
});

app.listen(8080, () => console.log('listening on port 8080'));