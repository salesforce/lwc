let instances = [];

export class BroadcastAdapter {
    callback;

    static clearInstances() {
        instances = [];
    }

    static broadcastData(data) {
        instances.forEach(instance => {
            instance.callback(data);
        });
    }

    constructor(callback) {
        this.callback = callback;
        instances.push(this);
    }

    update() {}

    connect() {}

    disconnect() {}
}
