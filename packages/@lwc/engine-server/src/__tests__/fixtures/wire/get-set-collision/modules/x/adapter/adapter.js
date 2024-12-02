export class Adapter {
    constructor(dataCallback) {
        this.callback = dataCallback;
    }

    connect() {}

    update(cfg) {
        this.callback(cfg.value);
    }

    disconnect() {}
}
