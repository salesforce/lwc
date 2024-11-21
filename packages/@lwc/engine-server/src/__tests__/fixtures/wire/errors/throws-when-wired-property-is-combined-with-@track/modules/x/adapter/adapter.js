export class Adapter {
    constructor(dataCallback) {
        this.callback = dataCallback;
    }

    connect() {}

    update() {
        this.callback(true);
    }

    disconnect() {}
}
