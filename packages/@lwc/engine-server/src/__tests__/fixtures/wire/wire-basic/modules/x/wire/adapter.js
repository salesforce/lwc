export let isAdapterInvoked = false;

export class adapter {
    constructor(dataCallback) {
        this.dc = dataCallback;
    }

    connect() {}

    update() {
        isAdapterInvoked = true;
        this.dc(true);
    }

    disconnect() {}
}
