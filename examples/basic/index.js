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

app.use('/static', mamba.static('./static'));

app.io.on('connection', s => {
    console.log('connected!');

    s.emit('hello', 'world!');

    s.on('disconnect', () => {
        console.log('Disconnected!');
    });

    s.on('ping', () => s.emit('ping', 'pong'));
});

app.listen(8080, () => console.log('o/: listening on port 8080'));

