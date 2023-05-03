let adapterSpy;

export class ContextAwareWireAdapter {
    callback;
    sourceElement;

    static setSpy(spy) {
        adapterSpy = spy;
    }

    constructor(callback, sourceElement) {
        this.callback = callback;
        this.sourceElement = sourceElement;

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
            adapterSpy.push({ source: this.sourceElement, method, args });
        }
    }
}
