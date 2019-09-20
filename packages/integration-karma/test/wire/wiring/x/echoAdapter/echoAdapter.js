let adapterSpy;

export class EchoWireAdapter {
    callback;

    static setSpy(spy) {
        adapterSpy = spy;
    }

    constructor(callback) {
        this.callback = callback;
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
    }
}
