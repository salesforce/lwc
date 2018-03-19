/**
 * Todo imperative APIs and wire adapters.
 */

import { register } from 'wire-service';
import getObservable from './todo';

// Component-importable imperative access.
export function getTodo(config) {
    return new Promise((resolve, reject) => {
        const observable = getObservable(config);
        if (!observable) {
            return reject(new Error('insufficient config'));
        }

        observable.subscribe({
            next: value => resolve(value),
            error: error => reject(error),
            complete: resolve
        });
    });
}

// Register the wire adapter for @wire(getTodo).
register(getTodo, function getTodoWireAdapter(targetSetter) {
    let subscription;
    let config;
    return {
        updatedCallback: (newConfig) => {
            config = newConfig;
            subscription = getObservable(config).subscribe({
                next: data => targetSetter({ data, error: undefined }),
                error: error => targetSetter({ data: undefined, error })
            });
        },

        connectedCallback: () => {
            // Subscribe to stream.
            subscription = getObservable(config).subscribe({
                next: data => targetSetter({ data, error: undefined }),
                error: error => targetSetter({ data: undefined, error })
            });
        },

        disconnectedCallback: () => {
            subscription.unsubscribe();
        }
    };
});
