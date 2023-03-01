import { createContextProvider } from 'lwc';

export class WireAdapterA {
    contextValue = { value: 'missing' };
    static contextSchema = { value: 'required' };

    constructor(callback) {
        this._callback = callback;
    }

    connect() {
        // noop
    }

    disconnect() {
        // noop
    }

    update(_config, context) {
        if (context) {
            if (!context.hasOwnProperty('value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._callback(this.contextValue);
        }
    }

}

export const contextualizerA = createContextProvider(WireAdapterA);

export class WireAdapterB {
    contextValue = { value: 'missing' };
    static contextSchema = { value: 'required' };

    constructor(callback) {
        this._callback = callback;
    }

    connect() {
        // noop
    }

    disconnect() {
        // noop
    }

    update(_config, context) {
        if (context) {
            if (!hasOwnProperty.call(context, 'value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._callback(this.contextValue);
        }
    }

}

export const contextualizerB = createContextProvider(WireAdapterB);
