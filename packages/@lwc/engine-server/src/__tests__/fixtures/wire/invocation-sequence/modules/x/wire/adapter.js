export let invocationSequence = [];

export class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {
        invocationSequence.push('connect');
    }

    update() {
        invocationSequence.push('update');
        this.dc(true);
    }

    disconnect() {}
}
