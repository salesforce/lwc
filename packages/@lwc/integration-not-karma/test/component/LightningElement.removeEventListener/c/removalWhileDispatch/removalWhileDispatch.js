import { LightningElement } from 'lwc';

export default class RemovalWhileDispatch extends LightningElement {
    connectedCallback() {
        const handlerB = (evt) => {
            evt.detail.handlers.push('b');
        };

        const handlerA = (evt) => {
            evt.detail.handlers.push('a');
            this.removeEventListener('test', handlerB);
        };

        this.addEventListener('test', handlerA);
        this.addEventListener('test', handlerB);

        this.dispatchEvent(
            new CustomEvent('test', {
                detail: {
                    handlers: [],
                },
            })
        );
    }
}
