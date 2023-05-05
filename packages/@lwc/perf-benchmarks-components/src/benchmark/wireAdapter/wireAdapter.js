export class WireAdapter {
    callback;
    hostElementTagName;

    constructor(callback, hostContext) {
        this.callback = callback;
        this.hostElementTagName = hostContext;

        callback(this.hostElementTagName);
    }

    update(_) {
        this.callback(this.hostElementTagName);
    }

    connect() {}
    disconnect() {}
}
