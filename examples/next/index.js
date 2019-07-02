const mamba = require('../../index');
const next = require('next');
const path = require('path');
const n = next({
    dev: true,
    dir: './client'
});

const app = mamba();

const toPath = (req, directory) => path.normalize(req.url.replace('/' + directory, ''));

(async () => {
    await n.prepare();

    app.get('/_next/*', (req, res) => {

        return res.sendFile(`./client/.next/${toPath(req, '_next')}`);
    });

    app.get('/static/*', (req, res) => {
        return res.sendFile(`./client/static/${toPath(req, 'static')}`);
    });

    app.get('/*', (req, res) => {
        let path = req.url.replace('/', '');
        let page = `/${path || 'index'}`;
        n.render(req, res, page, req.params);
    });

    app.listen(8080, () => console.log('o/: listening on 8080'));
})();