export let isAdapterInvoked = false;

class Adapter {
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

const arrowFnWithAdapter = () => {};
arrowFnWithAdapter.adapter = Adapter;

export { arrowFnWithAdapter };
