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

    app.ws('/', {
        compression: 1,
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

            ws.removeListener = ws.ee.removeListener;

            ws.disconnect = () => {
                ws.close();
            };

            app.io.emit('connection', ws);
        },
        message: (ws, message) => {
            try {
                let data = JSON.parse(message);
                ws.ee.emit(data[0], data[1]);
            } catch(e) {
                console.error(e);
            }
        },
        close: (ws) => {
            ws.ee.emit('disconnect', ws);
        }
    });
};