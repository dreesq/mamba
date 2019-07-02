const mamba = require('../../index');
const next = require('next');
const n = next({
    dev: true,
    dir: './client'
});

const app = mamba();

(async () => {
    await n.prepare();

    app.get('/_next/*', (req, res) => {
        let path = req.url.replace('/_next', '');
        return res.sendFile(`./client/.next/${path}`);
    });

    app.get('/static/*', (req, res) => {
        let path = req.url.replace('/static', '');
        return res.sendFile(`./client/static/${path}`);
    });

    app.get('/*', (req, res) => {
        let path = req.url.replace('/', '');
        let page = `/${path || 'index'}`;
        n.render(req, res, page, req.params);
    });

    app.listen(8080, () => console.log('o/: listening on 8080'));
})();