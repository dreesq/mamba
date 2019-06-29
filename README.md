# mamba
Fast, express compatible http web server using uWebSockets.js

```js
const mamba = require('@dreesq/mamba');

const app = mamba();
let i = 0;

const test = async (req, res, next) => {
    ++i;
    next();
};

app.get('/:x', test, async (req, res) => {
    res.end(`${i}-${req.params.x}`);
});

app.listen(8080, () => console.log('listening on port 8080'));
```