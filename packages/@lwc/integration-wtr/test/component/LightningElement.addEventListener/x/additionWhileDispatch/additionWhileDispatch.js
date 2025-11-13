import { LightningElement } from 'lwc';

export default class AdditionWhileDispatch extends LightningElement {
    connectedCallback() {
        const handlerB = (evt) => {
            evt.detail.handlers.push('b');
        };

        const handlerA = (evt) => {
            evt.detail.handlers.push('a');
            this.addEventListener('test', handlerB);
        };

        this.addEventListener('test', handlerA);

        this.dispatchEvent(
            new CustomEvent('test', {
                detail: {
                    handlers: [],
                },
            })
        );
    }
}
