import { register, ValueChangedEvent } from 'wire-service';

export const wireContextAdapter = () => {};

register(wireContextAdapter, (wiredEventTarget) => {
    wiredEventTarget.addEventListener('connect', () => {
        const srEvent = new CustomEvent('wirecontextevent', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                callback: (contextValue) => {
                    wiredEventTarget.dispatchEvent(new ValueChangedEvent(contextValue));
                },
            },
        });

        wiredEventTarget.dispatchEvent(srEvent);
    });
});
