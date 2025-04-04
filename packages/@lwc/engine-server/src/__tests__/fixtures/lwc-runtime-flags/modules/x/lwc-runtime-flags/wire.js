export class getRuntimeFlags {
    config = { initial: true };

    flags;

    constructor(callback) {
        this.callback = callback;
    }

    update(config) {
        this.config = {
            ...config,
            initial: false,
        };
        this.callback({
            flags: this.flags,
            config: this.config,
        });
    }

    connect() {
        this.flags = Reflect.get(globalThis, 'lwcRuntimeFlags');
        this.callback({
            flags: this.flags,
            config: this.config,
        });
    }

    disconnect() {
        // Intentionally empty
    }
}
