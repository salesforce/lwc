import { register, ValueChangedEvent } from 'wire-service';

export function EchoWireAdapter() {}

register(EchoWireAdapter, (wireEventTarget) => {
    wireEventTarget.addEventListener('config', (config) => {
        wireEventTarget.dispatchEvent(new ValueChangedEvent(config));
    });
});
