const mamba = require('../../index');

const app = mamba({
    socket: true,
    busboy: {
        limits: {
            fileSize: 1,
            files: 2,
        }
    }
});

let i = 0;

const test = async (req, res, next) => {
    ++i;
    next();
};

app.use((req, res, next, error) => {
    console.log(error);
    res.end('X');
});

app.get('/', (req, res) => res.end('Done'));

app.get('/download', (req, res) => {
    res.download('./test.html');
});

app.post('/', (req, res) => {
    console.log(req.files);
    res.json(req.body);
});

app.listen(8080, () => console.log('o/: listening on port 8080'));

