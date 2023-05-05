let adapterSpy;

export class ContextAwareWireAdapter {
    callback;
    hostContext;

    static setSpy(spy) {
        adapterSpy = spy;
    }

    constructor(callback, hostContext) {
        this.callback = callback;
        this.hostContext = hostContext;

        this.log('constructor');
    }

    update() {
        this.log('update', arguments);
    }

    connect() {
        this.log('connect', arguments);
    }

    disconnect() {
        this.log('disconnect', arguments);
    }

    log(method, args) {
        if (adapterSpy) {
            adapterSpy.push({ hostContext: this.hostContext, method, args });
        }
    }
}
