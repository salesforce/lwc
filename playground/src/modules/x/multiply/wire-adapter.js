/**
 * NOTE: Custom wire adapters are not supported on the Salesforce Platform.
 * This is for demonstration purposes only.
 */
export class multiply {
    /** @param {Function} dataCallback */
    constructor(dataCallback) {
        this.dataCallback = dataCallback;
    }
    connect() {
        // required, but not used for this demo
    }
    disconnect() {
        // required, but not used for this demo
    }
    /** @param {{first: number; second: number}} config  */
    update(config) {
        // Do a fake async data request
        this.dataCallback('...'); // "loading" state
        setTimeout(this.dataCallback, 500, config.first * config.second);
    }
}
