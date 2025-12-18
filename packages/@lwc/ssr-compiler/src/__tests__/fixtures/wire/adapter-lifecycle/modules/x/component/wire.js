export default class {
    constructor(callback) {
        this.callback = callback;
        this.state = [];
    }

    update(config) {
        this.state.push(`update(${config.value})`);
        this.callback([...this.state]);
    }

    connect() {
        this.state.push('connect');
        this.callback([...this.state]);
    }

    disconnect() {
        this.state.push('disconnect');
    }
}
