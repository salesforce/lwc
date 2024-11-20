export default class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {}

    update(config) {
        // Quotes are encoded in the output, which is ugly
        this.dc(JSON.stringify(config, null, 4).replace(/"/g, ''));
    }

    disconnect() {}
}
