export class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {}

    update(config) {
        this.dc(config.name);
    }

    disconnect() {}
}
