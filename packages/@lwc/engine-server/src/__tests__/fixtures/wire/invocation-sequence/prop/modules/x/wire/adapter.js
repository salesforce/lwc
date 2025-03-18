export let invocationSequence = [];

export class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {
        invocationSequence.push('adaptor connect()');
    }

    update() {
        invocationSequence.push('adaptor update()');
        this.dc(true);
    }

    disconnect() {}
}
