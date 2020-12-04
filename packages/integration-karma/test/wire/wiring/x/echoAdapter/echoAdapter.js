let adapterSpy;
let adapterNotifyCallback;

export class EchoWireAdapter {
    callback;
    listeners = {};

    static setSpy(spy, notifyCallback) {
        adapterSpy = spy;
        adapterNotifyCallback = notifyCallback;
    }

    constructor(callback) {
        this.callback = callback;
        callback({});
    }

    update(config) {
        // it passes as value the config
        this.log('update', arguments);
        this.callback(config);
    }

    connect() {
        this.log('connect', arguments);
    }

    disconnect() {
        this.log('disconnect', arguments);
    }

    log(method, args) {
        if (adapterSpy) {
            adapterSpy.push({ method, args });
        }
        if (adapterNotifyCallback) {
            adapterNotifyCallback(method, args);
        }
    }
}
