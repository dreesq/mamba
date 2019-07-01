const EventEmitter = require('eventemitter3');

/**
 * Socket.io syntax like socket server
 * @param app
 */

exports.init = app => {
    if (!app.config.socket) {
        return;
    }

    app.io = new EventEmitter();

    app.ws('/*', {
        compression: 0,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: 0,
        open: (ws, req) => {
            ws.ee = new EventEmitter();
            ws.request = req;

            ws.join = room => {
                ws.subscribe(room);
            };

            ws.leave = room => {
                ws.unsubscribe(room);
            };

            ws.in = room => {
                return {
                    emit: (...args) => {
                        ws.publish(room, JSON.stringify(args));
                    }
                }
            };

            ws.emit = (...args) => {
                ws.send(JSON.stringify(args));
            };

            ws.removeListener = (...args) => ws.ee.removeListener(...args);
            ws.on = (...args) => ws.ee.on(...args);

            ws.disconnect = () => {
                ws.close();
            };

            app.io.emit('connection', ws);
        },
        message: (ws, payload) => {
            payload = String.fromCharCode.apply(null, new Uint8Array(payload));

            try {
                let [event, data] = JSON.parse(payload);
                ws.ee.emit(event, data);
            } catch(e) {
                console.error(e);
            }
        },
        close: (ws) => {
            ws.ee.emit('disconnect', ws);
        }
    });
};