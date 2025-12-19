export let invocationSequence = [];

export class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {
        invocationSequence.push('adapter connect()');
    }

    update() {
        invocationSequence.push('adapter update()');
        this.dc(true);
    }

    disconnect() {}
}
